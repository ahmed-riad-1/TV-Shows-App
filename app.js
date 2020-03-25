const API = 'https://api.tvmaze.com/search/shows?q='
const SINGLE = 'https://api.tvmaze.com/shows/'

const searchForm = document.getElementById('search-form')
const resultContainer = document.getElementById('results')

const getDataBySearch = async q => {
    const data = await fetch(`${API}${q}`).then(res => res.json())
    return data
}

const getSingle = async id => {
    const data = await fetch(`${SINGLE}${id}`).then(res => res.json())
    return data
}

let previous = ''

document.addEventListener('DOMContentLoaded', e => {
    if (window.location.hash) {
        const id = parseInt(window.location.hash.replace('#', ''))
        console.log(id)
        renderSingle(e);
    }
})

const addLoader = parent => {
    parent.insertAdjacentHTML('afterbegin', '<div class="loader" id="loader"><i class="fa fa-undo spin fa-4x"></i></div>')
}

const removeLoader = () => document.getElementById('loader').parentElement.removeChild(document.getElementById('loader'))


searchForm.addEventListener('submit', async e => {
    e.preventDefault()
    const q = searchForm['search'].value
    if (q !== previous && q) {
        history.replaceState(null, null, ' ')
        resultContainer.innerHTML = ''
        if (document.querySelector('.single')) document.querySelector('.single').parentElement.removeChild(document.querySelector('.single'))
        addLoader(resultContainer)
        previous = q
        const data = await getDataBySearch(q)
        let HTML = ''
        data.forEach(el => {
            let image = el.show.image
                ? `<img src="${el.show.image.medium}" alt="Show Image" />`
                : '<img src="noImg.png" alt="Show Image" />'
            let genres = ''
            el.show.genres.forEach(genre => genres += `<span class="pill">${genre}</span>`)
            if (!genres) {
                genres = '<span class="pill red-pill">None</span>'
            }
            HTML += `
            <a class="show" href="#${el.show.id}">
            <div class="card">
                ${image}
                <div class="content">
                    <p class="name">${el.show.name}</p>
                    <div class="genres">
                        ${genres}
                    </div>
                </div>
            </div>
                <h4>${el.show.name}</h4>
            </a>
        `
        })
        if (!HTML) {
            HTML = `<div class="alert alert-red"><i class="fa fa-exclamation-circle"></i> No Result Found For '${q}'</div>`
        }

        resultContainer.insertAdjacentHTML('afterbegin', HTML)
        removeLoader()
    }
})


const renderSingle = async e => {
    resultContainer.innerHTML = ''
    if (document.querySelector('.single')) document.querySelector('.single').parentElement.removeChild(document.querySelector('.single'))
    previous = ''
    addLoader(resultContainer)
    const id = parseInt(window.location.hash.replace('#', ''))
    if (isNaN(id)) {
        removeLoader()
        document.getElementById('cards').insertAdjacentHTML('afterend', `
        <section class="single">
            <div class="container">
                <div class="alert alert-red"><i class="fa fa-exclamation-circle"></i> Inavlid ID '${id}' </div>
            </div>
        </section>
        `)
        return;
    }
    // - GET TV SHOW INFO
    const data = await getSingle(id)
    console.log(data)
    if (data.status === 404) {
        removeLoader()
        document.getElementById('cards').insertAdjacentHTML('afterend', `
        <section class="single">
            <div class="container">
                <div class="alert alert-red"><i class="fa fa-exclamation-circle"></i> No TV Show Found With The ID '${id}' </div>
            </div>
        </section>
        `)
        return;
    }
    // TODO: 
    // - RENDER PAGE
    let image = data.image
        ? `<img src="${data.image.medium}" alt="Show Image" />`
        : '<img src="noImg.png" alt="Show Image" />'
    let genres = ''
    data.genres.forEach(genre => genres += `<span class="pill">${genre}</span>`)
    if (!genres) {
        genres = '<span class="pill red-pill">None</span>'
    }

    const page = `
    <section class="single">
        
        <div class="container">
        
            <div class="left">
                <a id="backlink" class="back" href="/"><i class="fa fa-arrow-left"></i> Back</a>
                ${image}
            </div>

            <div class="right">
                <h1>${data.name}</h1>
                ${data.summary}
                <span class="t">Genres: </span>
                <div class="genres-pills">
                    ${genres}
                </div>
                <p>Language: ${data.language}</p>
                <div class="links">
                    <a class="more" href="${data.officialSite}" target="_blanc" >Official Site</a>
                </div>
            </div>

        </div>
    </section>
    `
    document.getElementById('cards').insertAdjacentHTML('afterend', page)
    removeLoader()
    document.getElementById('backlink').addEventListener('click', e => {
        e.preventDefault()
        if (searchForm['search'].value) {
            searchForm['btn'].click()
        } else {
            if (data.name) {
                let arr = data.name.split(' ')
                searchForm['search'].value = arr[Math.floor(Math.random() * (arr.length - 1))]
                searchForm['btn'].click()
            } else {
                window.location = document.getElementById('backlink').href
            }
        }
    })

}


window.addEventListener('hashchange', renderSingle)

