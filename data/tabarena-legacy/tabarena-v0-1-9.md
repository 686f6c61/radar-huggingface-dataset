# TabArena-Legacy/TabArena-v0.1.9

## Resumen

TabArena-Legacy/TabArena-v0.1.9 no es un modelo de IA, sino una copia congelada del Space de Hugging Face que servía el leaderboard de TabArena, fijada en la versión v0.1.9.9 (21/10/2026, commit del Space `dc7325980`). Se publicó como archivo justo antes de que el leaderboard se rediseñara en la versión v0.1.9.10, con el objetivo de preservar tanto el código del frontend como los datos publicados tal y como estaban en ese momento.

El repositorio contiene la aplicación Gradio de visualización, los CSV con los resultados publicados y los endpoints JSON/MCP definidos en `api.py`. No incluye pesos, tokenizadores ni artefactos de entrenamiento: su función es la reproducibilidad de las puntuaciones (Elo e Improvability) de sistemas de machine learning tabular evaluados en TabArena y BeyondArena.

Su relevancia es documental: permite citar y auditar un ranking histórico concreto sin depender de que el Space en producción siga mostrando los mismos números. La copia no se ejecuta en la infraestructura de Hugging Face y requiere clonarla y arrancarla en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo. Aplicación frontend Gradio para un leaderboard |
| Parametros totales | No disponible (no hay pesos ni modelo entrenado) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible en los metadatos; la documentación del repositorio está en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica: el repositorio contiene código Python y ficheros CSV, no safetensors ni GGUF |
| ID en HuggingFace | TabArena-Legacy/TabArena-v0.1.9 |
| Version archivada | v0.1.9.9 (2026/10/21, Space commit `dc7325980`) |
| Tamano del repositorio | 0.0 GB reportados |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |
| Fecha de creacion / actualizacion | 2026-10-24 / 2026-10-24 |
| Punto de entrada | `python main.py`, servidor en `http://127.0.0.1:7860` |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni proceso de entrenamiento. El artefacto es un snapshot de una aplicación web: un frontend Gradio (`main.py`) que lee resultados tabulares almacenados como CSV planos bajo rutas del tipo `data/entrants_{...}/imputation_{yes,no}/splits_{all,lite}/tasks_{...}/datasets_{...}/`, más una rama separada `data_beyondarena/subsets/{subset}/` para los subconjuntos de BeyondArena. El código y los datos son los del Space original, sin modificar; únicamente se sustituyó la cabecera de configuración del Space por una nota explicativa del archivado.

La capa de servicio incluye cuatro endpoints JSON definidos en `api.py`: `list_leaderboards`, `get_tabarena_leaderboard`, `get_beyondarena_leaderboard` y `get_pareto_frontier`. Los mismos cuatro se exponen como herramientas MCP en `/gradio_api/mcp/`, y el contrato de uso para agentes se documenta en `AGENTS.md`, con dos restricciones explícitas sobre cómo deben redactarse las descripciones. La métrica principal es un Elo por pares sobre el conjunto de participantes que compitieron, y la métrica Improvability se define como la distancia al mejor de ese mismo conjunto; por eso cada pool de participantes constituye una evaluación independiente con sus propios números, y el parámetro `entrants` no actúa como filtro de filas.

## Capacidades

- Servir una instantánea inmutable del leaderboard de TabArena en su versión v0.1.9.9, con los datos y el código originales.
- Exponer los resultados como CSV planos accesibles por descarga directa, sin cola ni token.
- Ofrecer cuatro endpoints JSON para consumo programático: listado de leaderboards, leaderboard de TabArena, leaderboard de BeyondArena y frontera de Pareto.
- Publicar los mismos cuatro endpoints como herramientas MCP en `/gradio_api/mcp/`, lo que permite que agentes los invoquen de forma estructurada.
- Soportar ocho configuraciones de participantes: `models` (solo modelos individuales, por defecto), `open`, `llm`, `api`, `open_llm`, `open_api`, `llm_api` y `open_llm_api`.
- Filtrar por tratamiento de imputación (`imputation_yes` / `imputation_no`), por conjunto de splits (`splits_all` / `splits_lite`), por tareas y por datasets.
- Servir subconjuntos de BeyondArena bajo `data_beyondarena/subsets/{subset}/`.
- Ejecución local del frontend Gradio para desarrollo o consulta.
- No incluye generación de texto, razonamiento, código, visión, audio ni tool calling de un LLM: no hay modelo subyacente.

## Casos de uso

- Reproducibilidad de citas academicas: al estar congelada en v0.1.9.9 con fecha y commit, permite referenciar en un paper el ranking exacto que existía el 21/10/2026 sin riesgo de que el Space en producción haya cambiado de números.
- Auditoria de rankings historicos: un revisor puede clonar el repositorio, arrancarlo en local y verificar que las puntuaciones Elo e Improvability citadas coinciden con los CSV publicados en esa versión.
- Analisis de datos con pandas o R: los CSV siguen una ruta predecible, de modo que un script puede descargar varias combinaciones de `imputation`, `splits`, `tasks` y `datasets` y construir tablas comparativas propias sin depender de la interfaz web.
- Integracion en agentes: mediante los cuatro endpoints JSON o las herramientas MCP, un agente puede consultar qué modelo tabular encabeza un subconjunto concreto y devolver la respuesta en formato estructurado, útil en asistentes de selección de modelos.
- Docencia y divulgación: el frontend local permite mostrar en clase cómo evolucionan los métodos de AutoML tabular y comparar metodologías con y sin imputación, sin depender de la disponibilidad del Space público.
- Desarrollo y bifurcación del frontend: el repositorio incluye `pyproject.toml` y `requirements.txt`, por lo que sirve como base para modificar la visualización o añadir métricas propias partiendo del código original.
- Archivado a largo plazo: conserva el estado previo al rediseño de v0.1.9.10, lo que permite comparar la estructura de datos y las métricas antiguas con las nuevas.
- Verificacion de la frontera de Pareto: el endpoint `get_pareto_frontier` permite identificar los sistemas no dominados de un pool concreto para decidir qué candidatos merece la pena evaluar en un benchmark propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio contiene los CSV con las puntuaciones de los sistemas tabulares evaluados en TabArena y BeyondArena, pero la información proporcionada no incluye esos valores, por lo que no se reproducen aquí. Tampoco existen métricas de rendimiento del propio artefacto (latencia, throughput) más allá de que se trata de una aplicación Gradio servida en local.

## Requisitos de hardware

- VRAM: 0 GB. No hay inferencia de red neuronal; la aplicación solo sirve páginas y CSV.
- GPU: no se requiere ninguna GPU, ni consumer ni de centro de datos (A100, H100, RTX 4090 son irrelevantes para este artefacto).
- CPU y memoria: suficientes para ejecutar Python y Gradio; las versiones exactas de las dependencias están declaradas en `pyproject.toml` y `requirements.txt`, pero no se detallan en la información disponible.
- Despliegue: clonado del repositorio, instalación de dependencias con `uv pip install -r pyproject.toml` o `pip install -r requirements.txt`, y arranque con `python main.py`; el servicio queda en `http://127.0.0.1:7860`.
- No aplican vLLM, llama.cpp, Ollama ni TGI: no hay pesos que servir.
- Almacenamiento: el repositorio reporta 0.0 GB, aunque conviene verificar el tamano real tras el clonado porque los CSV de resultados pueden estar gestionados por LFS.
- Latencia y throughput: no disponibles; dependen del número de peticiones concurrentes a Gradio y del tamano de los CSV consultados.

## Comparativa con modelos similares

| Artefacto | Tipo | Contenido | Versionado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TabArena-Legacy/TabArena-v0.1.9 | Archivo congelado de un Space | Codigo Gradio, CSV de resultados y endpoints JSON/MCP de v0.1.9.9 | Fijo en v0.1.9.9 (commit `dc7325980`) | Apache-2.0 | Repositorio de solo lectura; requiere ejecucion local |
| TabArena leaderboard (Space actual) | Leaderboard en produccion | Mismo tipo de contenido, rediseñado desde v0.1.9.10 | Evoluciona con el tiempo | No indicada en la informacion | Ejecutable en Hugging Face Spaces |
| TabArena codebase (autogluon/tabarena) | Codigo fuente del benchmark | Scripts de evaluacion, incluido `run_generate_website_artifacts.py` | Rama principal del repositorio | No indicada en la informacion | Repositorio GitHub |

No se dispone de datos para comparar con leaderboards de terceros (por ejemplo, de otras suites de ML tabular) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no puede usarse para tareas de inferencia. Cualquier expectativa de uso como LLM es un error de interpretación del identificador.
- La copia no se ejecuta en Hugging Face. El Space archivado ha perdido su runtime; solo funciona clonándolo y arrancándolo en local.
- Los datos están congelados en v0.1.9.9 y no recibirán actualizaciones. Cualquier comparación con el leaderboard actual (v0.1.9.10 o posterior) puede no ser homogénea, ya que el rediseño puede haber alterado la presentación o el conjunto de participantes.
- Los ejemplos de `curl` del README apuntan a `huggingface.co/spaces/TabArena/leaderboard`, no a este repositorio. Para leer los CSV de la copia archivada hay que ajustar la ruta al repositorio `TabArena-Legacy/TabArena-v0.1.9`.
- El repositorio reporta 0 descargas y 0 likes, por lo que no existe validación comunitaria que confirme la integridad de la copia más allá de la nota del autor.
- La licencia Apache-2.0 permite uso comercial del código, pero el contenido archivado son resultados de evaluación de terceros; conviene citar el paper de TabArena y verificar las condiciones de atribución de los datos originales antes de redistribuirlos.
- La documentación y los comentarios están en inglés; no se declaran idiomas soportados en los metadatos.
- El Elo depende del pool de participantes: comparar números entre configuraciones de `entrants` distintas (por ejemplo `models` frente a `open_llm_api`) es metodológicamente incorrecto, porque cada pool es una evaluación independiente.
- No se especifican versiones exactas de dependencias en la información disponible, lo que puede provocar incompatibilidades al reproducir el entorno pasado un tiempo.

## Enlaces

- Repositorio archivado: https://huggingface.co/TabArena-Legacy/TabArena-v0.1.9
- Leaderboard actual: https://huggingface.co/spaces/TabArena/leaderboard
- Sitio web de TabArena: https://tabarena.ai
- Paper (estudio IID de ML tabular): https://tabarena.ai/paper-tabular-ml-iid-study
- Codigo de TabArena: https://tabarena.ai/code
- Repositorio GitHub del benchmark: https://github.com/autogluon/tabarena
- Script de generacion de artefactos web: https://github.com/autogluon/tabarena/blob/main/scripts/run_generate_website_artifacts.py
