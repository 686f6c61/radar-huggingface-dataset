# strangelab/beat-this-final0-musetric-lossless

## Resumen

Beat This! final0 es un modelo de seguimiento de pulsos y tiempos fuertes (beat tracking y downbeat tracking) para audio musical, empaquetado en formato ONNX para inferencia offline. El modelo original fue entrenado por el grupo de investigación en Computer Perception and Intelligent Music Processing de la JKU Linz (Universidad Johannes Kepler de Linz) y exportado a ONNX por el proyecto Musetric para su motor de ritmo basado en WebGPU. Este repositorio concreto, publicado por el usuario strangelab, no contiene un modelo nuevo: es un reempaquetado de los tres ficheros de ritmo que Musetric descarga habitualmente (grafo ONNX, banco de filtros mel y configuración), comprimidos en un archivo tar.xz de 89,81 MB frente a los 190,91 MB originales.

La relevancia de este artefacto es logística, no algorítmica. Reduce en 101,10 MB (53,0 %) la transferencia inicial necesaria para una instalación limpia de la aplicación de escritorio Musetric, manteniendo intactos los hashes SHA-256 fijados por la aplicación. No se publican en la información disponible datos sobre arquitectura interna, número de parámetros, longitud de contexto (concepto poco aplicable a un modelo de clasificación de audio por tramas) ni composición del conjunto de entrenamiento.

El modelo es de tipo audio-classification con pipeline_tag `audio-classification` y etiquetas de beat-tracking, downbeat-tracking y music-information-retrieval. Su función es analizar una señal de audio y producir instantes de pulso y de tiempo fuerte, tarea clásica de MIR (Music Information Retrieval) útil para alineación rítmica, edición musical asistida y análisis estructural de grabaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo ONNX; el autor no detalla la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de clasificación por tramas de audio, no generativo) |
| Tipos de cuantizacion | no disponible (se distribuye el grafo ONNX original sin recuantizar) |
| Idiomas soportados | no disponible (la tarea es sobre audio musical, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafo `beat_this.onnx`), más banco de filtros mel y fichero de configuración |
| Tamano del artefacto | 89,81 MB comprimido (tar.xz); 190,91 MB expandido |
| SHA-256 del archivo | `ddc2aa610bfe99f20d8ef52e87e8c16e849898727cfef6071c75b9718ddf2898` |
| Modelo base | musetric/beat-this-onnx (revisión `25308706dda545c0d5950065bb0604ad71bcf1f5`) |
| Pipeline | audio-classification |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Se sabe que el artefacto es un grafo ONNX exportado por Musetric desde el modelo original de JKU Linz, acompañado de un banco de filtros mel y un fichero de configuración que forman el contrato de ejecución del motor de ritmo. El modelo se ejecuta mediante un motor nativo en Rust y, en el caso de la aplicación de escritorio, a través de un motor WebGPU para Chrome. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con refuerzo o preferencias; tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

El reempaquetado no altera el grafo: según la model card, los tres ficheros extraídos coinciden con los hashes SHA-256 fijados por Musetric, de modo que las predicciones de beat y downbeat son idénticas a las del modelo original. La verificación reportada cubre macOS: extracción en unos siete segundos en un Apple M4 y reproducción exacta de todos los tiempos de beat y downbeat del modelo original en tres grabaciones de 25, 46 y 120 segundos, con la red desactivada.

## Capacidades

- Seguimiento de pulsos (beat tracking) sobre audio musical: identifica los instantes de pulso rítmico.
- Seguimiento de tiempos fuertes (downbeat tracking): marca el primer pulso de cada compás.
- Inferencia offline: el paquete está pensado para ejecutarse sin conexión de red una vez extraído.
- Ejecución en WebGPU mediante el motor de ritmo de Musetric en Chrome.
- Integración con el cargador de caché nativo en Rust de la aplicación, que valida los ficheros antes de usarlos.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, por tratarse de un modelo de clasificación de audio.

## Casos de uso

- Análisis rítmico en producción musical asistida: extraer pulsos y tiempos fuertes de una grabación para alinear bucles, cuantizar tomas o generar mapas de tempo; el modelo está entrenado específicamente para esta tarea y se ejecuta offline.
- Instalación limpia de Musetric en macOS: descargar el archivo comprimido y extraerlo en `~/Library/Application Support/Musetric/models`, reduciendo la transferencia inicial de 190,91 MB a 89,81 MB.
- Despliegue en Linux: extraer en `${XDG_DATA_HOME:-$HOME/.local/share}/Musetric/models` siguiendo la ruta documentada por la aplicación.
- Despliegue en Windows: extraer en `%LOCALAPPDATA%\Musetric\models` con un descompresor compatible con XZ, dejando el grafo en `models/beat-this-onnx/beat_this.onnx`.
- Sincronización audiovisual: usar los tiempos de beat y downbeat para cortar vídeo o animaciones al ritmo de la música en herramientas de edición que consuman el grafo ONNX.
- Análisis estructural de catálogos musicales: procesar lotes de grabaciones en local para obtener mapas rítmicos sin enviar audio a servicios externos, algo relevante por privacidad y por coste de ancho de banda.
- Investigación en MIR: servir como referencia reproducible del modelo Beat This! de JKU Linz en experimentos que requieran el grafo ONNX original con hashes verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una verificación funcional: reproducción exacta de todos los tiempos de beat y downbeat del modelo original en tres grabaciones de 25, 46 y 120 segundos, y una extracción de unos siete segundos en un Apple M4. No se aportan cifras de F-measure, accuracy ni latencia de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un grafo ONNX de clasificación de audio, el consumo depende del tamaño del grafo y de la longitud de las ventanas de audio procesadas, datos que no se publican.
- GPU recomendadas: no disponible. La model card solo menciona ejecución mediante WebGPU en Chrome y mediante el motor nativo en Rust de Musetric.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la verificación reportada se hizo en un Apple M4.
- Opciones de despliegue: ONNX Runtime a través de la aplicación Musetric (motor nativo en Rust y motor WebGPU en Chrome). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Solo se indica que la extracción del archivo tardó unos siete segundos en un Apple M4.
- Espacio en disco: reservar espacio para el archivo comprimido y para los 190,91 MB de ficheros extraídos durante la instalación.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| strangelab/beat-this-final0-musetric-lossless | ONNX empaquetado en tar.xz | 89,81 MB comprimido / 190,91 MB expandido | Beat y downbeat tracking | MIT | Reempaquetado de musetric/beat-this-onnx con hashes verificados |
| musetric/beat-this-onnx | ONNX | 190,91 MB (tres ficheros) | Beat y downbeat tracking | MIT | Exportación original a ONNX; modelo base de este repositorio |
| Modelo original Beat This! de JKU Linz | no disponible en la información proporcionada | no disponible | Beat y downbeat tracking | MIT (según la model card) | Entrenado por el grupo de JKU Linz; referencia algorítmica del paquete |

No se dispone de datos de rendimiento comparado entre estas variantes más allá de la equivalencia funcional declarada (mismos tiempos de beat y downbeat en las tres grabaciones de prueba).

## Limitaciones y advertencias

- No es un modelo nuevo ni un ajuste fino: es un reempaquetado de ficheros existentes; el tamaño instalado, las predicciones y el coste de inferencia son los del grafo original.
- La verificación funcional reportada cubre únicamente macOS; las rutas de Windows y Linux provienen de la documentación de la aplicación, no de pruebas del autor del paquete.
- Una futura versión de Musetric puede fijar ficheros distintos, lo que invalidaría la utilidad de este paquete para esa versión.
- El paquete está atado a una revisión concreta del modelo base (`25308706dda545c0d5950065bb0604ad71bcf1f5`); no se garantiza compatibilidad con otras revisiones.
- No se documentan sesgos, tasas de alucinación ni comportamiento en géneros musicales concretos; al ser un modelo de clasificación de audio, el riesgo de alucinación en el sentido de los modelos generativos no aplica, pero sí el de predicciones erróneas en música con tempo ambiguo o compases irregulares.
- No hay información sobre rendimiento en idiomas ni sobre sesgos culturales en la definición de pulso y compás.
- La licencia MIT permite uso comercial, pero deben conservarse los avisos de copyright incluidos en el archivo (los de JKU Linz y los de Musetric).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/strangelab/beat-this-final0-musetric-lossless
- Modelo base en Hugging Face: https://huggingface.co/musetric/beat-this-onnx/tree/25308706dda545c0d5950065bb0604ad71bcf1f5
- Pin verificado de la aplicación Musetric: https://github.com/popelenkow/musetric/blob/3009c082df39a533a327b527c7885bc239d19f3f/packages/ai/src/runtime/rhythm/pin.json
- Directorios de datos de la aplicación de escritorio: https://github.com/popelenkow/musetric/blob/3009c082df39a533a327b527c7885bc239d19f3f/packages/app/readme.md#data
- Verificación de caché de la aplicación: https://github.com/popelenkow/musetric/blob/3009c082df39a533a327b527c7885bc239d19f3f/packages/server/crates/gpu/src/cache.rs#L303
- Modelo y autores originales (JKU Linz): https://github.com/CPJKU/beat_this
- Avisos de terceros de Musetric: https://github.com/popelenkow/musetric/blob/3009c082df39a533a327b527c7885bc239d19f3f/thirdPartyNotices.md
