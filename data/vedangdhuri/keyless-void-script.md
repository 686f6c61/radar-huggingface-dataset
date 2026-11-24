# vedangdhuri/keyless-void-script

## Resumen
El repositorio `vedangdhuri/keyless-void-script` no contiene un modelo de inteligencia artificial. Se trata de una publicacion en Hugging Face cuyo contenido es una model card que distribuye un supuesto ejecutable de Windows (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con contrasena) presentado como herramienta de tipo "cheat" para videojuegos, con funciones de radar 2D, filtro de botin, overlay externo y "panic key".

El artefacto se describe a si mismo como un binario externo en modo usuario para Windows de 64 bits, sin pesos, sin tokenizador, sin configuracion de transformers y sin pipeline asociado. Los tags del repositorio (windows, windows-11, x64, portable) y la ausencia total de ficheros de modelo confirman que no es un modelo de lenguaje, vision ni multimodal.

Desde la perspectiva de evaluacion de IA open source, esta ficha debe leerse como una advertencia: el repositorio no es evaluable como modelo, no aporta capacidades de inferencia y su contenido presenta patrones tipicos de distribucion de software potencialmente malicioso (ejecutable ofuscado, contrasena en el archivo, instrucciones para ejecutar como administrador y desactivar avisos de SmartScreen). No se debe descargar ni ejecutar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como binario externo para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin relacion con capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento
No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un programa para Windows de 64 bits con modulos denominados "user-mode external core", "render layer" y "hot-swap JSON profiles", con cifras de sondeo (476 Hz, 344 Hz) y tiempos de respuesta (menos de 27 ms, menos de 16 ms) que no son verificables ni corresponden a metricas de inferencia de un modelo.

No se documenta dataset, numero de tokens, composicion de datos, RLHF, DPO ni ninguna tecnica de aprendizaje. El contenido del repositorio es una pagina de descarga con enlaces a binarios alojados en GitHub Releases de terceros, no un conjunto de pesos.

## Capacidades
- No ofrece generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo de IA.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los idiomas listados son metadatos del repositorio.
- Las "capacidades" declaradas en la model card (radar 2D, filtro de botin, overlay externo, panic key, perfiles JSON) corresponden a un supuesto programa de trampas para videojuegos y no son verificables ni recomendables.

## Casos de uso
- No se identifica ningun caso de uso legitimo de IA para este repositorio.
- Evaluacion de riesgos de cadena de suministro: puede usarse como ejemplo de model card fraudulenta en formacion sobre seguridad de repositorios, sin descargar el binario.
- Auditoria de politicas de Hugging Face: sirve como caso de estudio de contenido que no cumple los criterios de publicacion de modelos.
- Investigacion de tecnicas de ingenieria social: el texto ilustra patrones de senuelo (insignias de valoracion, cifras de descargas infladas, contrasena en el ZIP).
- Analisis de deteccion de malware: el patron de ejecutable comprimido con contrasena y ejecucion como administrador es un indicador clasico que puede alimentar reglas de deteccion.
- Formacion en higiene de dependencias: util para explicar por que no se deben ejecutar binarios de repositorios sin trazabilidad ni firma.
- Ninguno de estos casos implica ejecutar el contenido del repositorio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (476 Hz, 344 Hz, menos de 27 ms, menos de 16 ms, valoracion 4,8/5, 490K descargas) no son mediciones de un modelo y no son verificables; los metadatos de Hugging Face indican 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (no hay pesos ni modelo que cargar).
- GPU recomendadas: no disponible (no aplica).
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es desplegable como modelo.
- Requisito declarado del binario: Windows de 64 bits, con instrucciones de ejecutar como administrador. Esto no es un requisito de inferencia y constituye un riesgo de seguridad.
- Latencia y throughput: no disponibles como metricas de modelo.

## Comparativa con modelos similares
No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a cualquier modelo open source real (por ejemplo, familias de transformers con pesos en safetensors o GGUF), la diferencia cualitativa es total: aqui no hay parametros, contexto, licencia de pesos ni artefacto de inferencia.

| Criterio | keyless-void-script | Modelo open source tipico |
|---|---|---|
| Pesos | No | Si (safetensors, GGUF) |
| Parametros | No aplica | Millones a cientos de miles de millones |
| Contexto | No aplica | Definido en config |
| Inferencia | No | Si, via vLLM, llama.cpp, TGI |
| Licencia de pesos | No hay pesos | MIT, Apache-2.0, etc. |
| Riesgo de seguridad | Alto (binario ofuscado) | Bajo si se verifica procedencia |

## Limitaciones y advertencias
- No es un modelo de IA: no puede evaluarse en MMLU, HumanEval, GSM8K ni ninguna otra prueba de modelo.
- Riesgo de seguridad alto: distribuye un ejecutable de Windows comprimido con contrasena, alojado en repositorios de GitHub de terceros, con instrucciones para ejecutarlo como administrador y para sortear avisos de Windows Defender y SmartScreen.
- La contrasena incluida en el propio texto ("2026") anula la proteccion del ZIP y es un patron habitual para evadir analisis antivirus automaticos.
- Los enlaces apuntan a cuentas de GitHub distintas de la del autor del repositorio de Hugging Face, lo que dificulta la trazabilidad.
- Cifras de descargas, valoracion y rendimiento no verificables y en contradiccion con los metadatos de la plataforma.
- La licencia MIT declarada no aporta garantias sobre el binario distribuido ni sobre su procedencia.
- No usar en produccion, en equipos personales ni en entornos corporativos. Si se ha descargado, no extraer ni ejecutar; eliminar y analizar el sistema.
- La presencia de este repositorio en Hugging Face no implica validacion por parte de la plataforma.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/vedangdhuri/keyless-void-script
- Enlace de descarga citado en la model card (no recomendado): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/YutozeXesi67/keyless-void-script/releases/latest
- Paper, blog o demo: no disponible.
