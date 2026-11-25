# teamwon/wordwords-windows

## Resumen

WordWords — Windows App no es un modelo de inteligencia artificial, sino una aplicación de escritorio para Windows distribuida a través de Hugging Face. Se trata de un programa Electron empaquetado con un instalador NSIS que ofrece contenido educativo offline para el sitio WordWords, orientado a escuelas primarias de Uganda (niveles KG–P7). El repositorio ocupa 5,8 GB, correspondientes principalmente a recursos multimedia (audio de palabras y de libros) y a los 32 libros de texto interactivos incluidos.

El paquete incluye un vocabulario de 7.088 palabras (Class Word + Oxford Plus) con audio, libros de texto interactivos de inglés, matemáticas, ciencias y estudios sociales, cuestionarios por nivel y un lector de Biblia. Todo el contenido funciona sin conexión, con la excepción de "Mango AI" (que requiere internet) y el lector de Biblia (que se abre en el navegador). La versión publicada es la v1.0.0, del 25 de noviembre de 2026.

Dado que no contiene pesos de modelo ni artefactos de inferencia, esta ficha no puede tratar el repositorio como un modelo de lenguaje. Los apartados siguientes reflejan esa circunstancia: los parámetros propios de un modelo (arquitectura, contexto, cuantización, benchmarks) figuran como "no disponible" o "no aplica", y se documenta en su lugar lo que el repositorio contiene realmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (aplicación de escritorio Electron; no es un modelo de IA) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (el contenido educativo está en inglés; no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | no aplica (distribución como instalador `WordWords.Setup.1.0.0.exe`, NSIS) |
| Tamano del repositorio | 5,8 GB |
| Version | v1.0.0 (2026-11-25) |
| Framework de aplicacion | Electron |
| Empaquetado | Instalador NSIS para Windows |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-25 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir: el repositorio contiene una aplicación Electron, no pesos entrenados. El contenido educativo se empaquetó el 25 de noviembre de 2026 a partir del sitio word.totalh.net y se distribuye junto con el instalador. No se documenta ningún proceso de entrenamiento, conjunto de datos, ajuste por RLHF/DPO ni innovación técnica de inferencia, porque no existe un modelo subyacente en el paquete.

La única funcionalidad que implica un componente de IA es "Mango AI", que según la model card requiere conexión a internet. No se especifica qué modelo, proveedor o API hay detrás de esa función, por lo que no es posible evaluar su arquitectura, tamaño ni comportamiento.

## Capacidades

- Visualización offline de vocabulario: 7.088 palabras (Class Word + Oxford Plus) con audio asociado.
- Lectura de 32 libros de texto interactivos de inglés, matemáticas, ciencias y estudios sociales, con audio de libro.
- Cuestionarios por materia y nivel (P1–P7), además de cuestionarios de historias.
- Lector de Biblia que se abre en el navegador.
- Funcionamiento sin conexión para todo el contenido anterior.
- Función "Mango AI" con acceso a internet (no se detalla su alcance ni sus capacidades).
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo propias de un modelo.

## Casos de uso

- Aula sin conectividad: el programa permite proyectar o usar en equipos Windows el vocabulario y los libros de texto sin depender de internet, lo que encaja en entornos escolares con red limitada.
- Refuerzo de vocabulario en primaria: los 7.088 términos con audio permiten practicar pronunciación y reconocimiento de palabras en niveles KG–P7.
- Estudio autónomo con cuestionarios: los ejercicios de inglés, matemáticas, ciencias y estudios sociales por nivel sirven para repaso individual o evaluación formativa en clase.
- Uso de libros interactivos en pizarra digital: los 32 libros con audio pueden emplearse como material de apoyo en sesiones guiadas por el docente.
- Lectura de historias y Biblia: el lector de historias y el de Biblia (este último en navegador) cubren actividades de lectura extensiva.
- Despliegue en equipos de bajo coste con Windows: al ser una aplicación Electron empaquetada, se instala con un único ejecutable y no requiere infraestructura de servidores ni GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que no procede comparar métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM: no aplica; no se ejecuta inferencia de un modelo local.
- GPU: no se requiere GPU para el funcionamiento descrito.
- CPU y RAM: no disponibles; la model card no especifica requisitos mínimos del sistema.
- Almacenamiento: el repositorio ocupa 5,8 GB, por lo que se debe prever espacio libre equivalente o superior tras la instalación.
- Sistema operativo: Windows (instalador NSIS `WordWords.Setup.1.0.0.exe`).
- Despliegue: instalación local mediante ejecutable; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay modelo que servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no es un modelo, sino una aplicación educativa de escritorio. Como referencia de categoría, podría compararse con otras aplicaciones offline de contenido educativo, pero no se dispone de datos de alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal; carece de pesos, tokenizador y pipeline de inferencia.
- Licencia no declarada: no se especifica la licencia del repositorio ni del contenido educativo, lo que impide confirmar si el uso comercial o la redistribución están permitidos.
- Idiomas no declarados: la model card no indica una lista formal de idiomas; el contenido parece estar en inglés.
- Dependencia de internet parcial: "Mango AI" requiere conexión y el lector de Biblia se abre en el navegador, por lo que la promesa de funcionamiento totalmente offline no cubre esas dos funciones.
- Sin métricas de calidad: no hay benchmarks, evaluaciones ni datos de rendimiento que permitan valorar la eficacia pedagógica.
- Contenido de terceros: el material proviene del sitio word.totalh.net y se empaquetó en una fecha concreta; no se documenta un proceso de actualización ni de control de calidad.
- Sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción o mantenimiento.
- Repositorio de gran tamaño: 5,8 GB pueden ser problemáticos en entornos con almacenamiento o ancho de banda limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/teamwon/wordwords-windows
- Código fuente de la aplicación: https://github.com/grace39237-sys/word-words-windows
- Código fuente del sitio: https://github.com/grace39237-sys/word-words
