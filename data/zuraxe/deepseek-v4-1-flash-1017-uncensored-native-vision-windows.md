# zuraxe/DeepSeek-V4.1-Flash-1017-Uncensored-Native-Vision-Windows

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-Native-Vision-Windows es un paquete de despliegue publicado por el usuario zuraxe en Hugging Face que combina los pesos del modelo DeepSeek V4.1 Flash 1017 Uncensored (procedentes de AtomicChat e ISTA-DASLab) con un runtime nativo, scripts de instalación y documentación para ejecutarlo en Windows x64 sobre una GPU RTX 5090 de 32 GB de VRAM. No se trata de un modelo entrenado por el autor del repositorio, sino de una distribución que ensambla pesos GGUF cuantizados, una torre de visión y una tabla Engram, y aporta las herramientas para fusionar los shards y arrancar el modelo en local.

El modelo base es una variante "uncensored" de DeepSeek V4.1 Flash en formato GGUF, con pipeline image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto. El paquete incorpora además un fichero MTP/visión y un proyector multimodal en BF16. La configuración está pensada para inferencia local en hardware de consumo de gama alta, con un límite de contexto configurado de 262.144 tokens.

Su relevancia radica en que ofrece un camino reproducible para ejecutar un modelo de gran tamaño cuantizado a IQ2_XXS en una sola GPU consumer, algo poco habitual en modelos de esta escala. El repositorio en sí ocupa unos 0,49 GB (solo software y documentación); los pesos completos suman 255,47 GB y se descargan desde los repositorios de sus autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek V4.1 Flash; transformer multimodal con torre de visión y tabla Engram, según los ficheros del paquete) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (límite configurado; no probado a longitud completa) |
| Tipos de cuantizacion | IQ2_XXS (modelo principal), IQ4_NL (tabla Engram), Q2_K (MTP/visión), BF16 (proyector multimodal mmproj) |
| Idiomas soportados | no disponible |
| Licencia | mit-weights-and-runtime-with-nvidia-cuda-redistributables (licencia "other" con nombre personalizado; ver NOTICE.md) |
| Formato de pesos | GGUF (shards fusionables), más runtime propio en Python |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base ni sus datos de entrenamiento. Por los ficheros que componen el paquete se deduce una arquitectura multimodal: un modelo principal cuantizado a IQ2_XXS, una torre de visión en BF16 (`mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf`), un fichero MTP/visión adicional en Q2_K (`V41-MTP-Vision-1017.Q2_K.gguf`) y una tabla Engram en IQ4_NL (`DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf`) que, según la model card, se lee desde el SSD. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

El paquete no reentrena ni recuantiza: el script `prepare_atomic.py` verifica los cuatro shards IQ2_XXS, los fusiona en `weights/atomic-iq2_xxs.gguf` sin recuantizar y comprueba el fichero resultante. El runtime es propio y nativo, no un import de Ollama ni de llama.cpp estándar. La fusión requiere unos 129 GiB de espacio SSD adicional, más 2 GiB de margen, y el conjunto completo con shards supera los 400 GiB.

## Capacidades

- Generación de texto conversacional mediante una página de chat local o un cliente conectado por API compatible con OpenAI.
- Entrada de imagen junto con texto (pipeline image-text-to-text), gracias a la torre de visión y al proyector multimodal incluidos.
- Modo "uncensored": el modelo base está publicado como variante sin censura, orientada a reducir rechazos en la generación.
- Contexto largo configurado de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con entrada de imágenes: el paquete permite arrancar una página de chat en Windows y enviar imágenes junto con texto, útil para prototipos de análisis visual sin depender de servicios en la nube.
- Procesamiento de documentos largos: con un contexto configurado de 262.144 tokens, puede emplearse para resumir o consultar expedientes extensos, siempre que el hardware soporte la longitud efectiva.
- Integración vía API compatible con OpenAI: un cliente existente puede apuntar al endpoint local del runtime para sustituir llamadas a la nube por inferencia en la propia máquina.
- Experimentación con modelos sin censura: investigadores que estudian el comportamiento de modelos "uncensored" pueden desplegar esta variante en local y comparar respuestas frente a versiones alineadas.
- Evaluación de cuantización extrema: el uso de IQ2_XXS en un modelo de gran tamaño permite medir la degradación de calidad frente a cuantizaciones mayores en un entorno controlado.
- Reproducción de entornos de investigación: los hashes SHA-256 en `UPSTREAM_WEIGHTS.json` y los scripts de verificación facilitan montar un entorno reproducible para experimentos que requieran pesos exactos.
- Desarrollo y pruebas offline: al ejecutarse en local con GPU consumer, sirve para desarrollar aplicaciones de visión-lenguaje sin conectividad ni costes por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: 29.000 MiB libres en la GPU 0 (RTX 5090 de 32 GB). Otras GPU no han sido probadas con este paquete.
- RAM del sistema: 92 GiB libres al arrancar; se recomienda un equipo con al menos 128 GiB instalados. El espacio de pagefile no cuenta para esta comprobación.
- CPU: al menos 11 CPUs lógicas disponibles; el lanzador usa seis workers con máscara de afinidad fija `0x555`.
- Almacenamiento: SSD rápido con al menos 270 GiB libres para el paquete ensamblado, el entorno Python y espacio de trabajo; más de 400 GiB si se conservan los shards y las copias de descarga.
- Software: Python 3.12 x64, controlador NVIDIA compatible con CUDA 13, runtime de Visual C++ x64 si Windows lo requiere, y `torch==2.10.0` desde el índice oficial de CUDA 13.
- Despliegue: runtime propio del paquete (`install.ps1` y `start.ps1`); no es compatible con Ollama ni con un import estándar de llama.cpp.
- Latencia y throughput: no disponibles; la model card indica que dependen del SSD, la RAM, la GPU y la longitud de contexto.
- GPU consumer: el paquete está diseñado específicamente para una RTX 5090; no se documenta compatibilidad con otras GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored-Native-Vision-Windows (este paquete) | no disponible | 262.144 tokens configurados | mit-weights-and-runtime-with-nvidia-cuda-redistributables | GGUF + runtime propio | Solo Windows x64 y RTX 5090 probados |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF | no disponible | no disponible | no disponible | GGUF (IQ2_XXS en 4 shards) | Repositorio de pesos original; sin runtime |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | no disponible | GGUF (Engram IQ4_NL, mmproj BF16) | Aporta tabla Engram y proyector de visión |
| IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored | no disponible | no disponible | no disponible | GGUF (MTP/visión Q2_K) | Aporta el fichero MTP/visión |

Los tres repositorios comparados son las fuentes de pesos del propio paquete, no alternativas independientes; no se dispone de datos de rendimiento ni de parámetros para comparar con modelos de otras familias.

## Limitaciones y advertencias

- El paquete solo ha sido probado en Windows x64 con una RTX 5090 de 32 GB; no hay garantía de funcionamiento en otro hardware o sistema operativo.
- Los requisitos son exigentes: 92 GiB de RAM libres al arrancar, 29.000 MiB de VRAM y más de 270 GiB de SSD, lo que excluye la mayoría de equipos de consumo.
- La cuantización IQ2_XXS es muy agresiva; es previsible cierta degradación de calidad respecto a los pesos originales, aunque no se documenta su magnitud.
- El contexto de 262.144 tokens está configurado pero no ha sido probado a longitud completa en distintas máquinas.
- El modelo es una variante "uncensored": puede producir contenido sin los filtros habituales, lo que traslada al operador la responsabilidad de moderación y cumplimiento.
- La licencia es personalizada ("mit-weights-and-runtime-with-nvidia-cuda-redistributables") y remite a NOTICE.md; conviene revisarla antes de cualquier uso comercial, especialmente por la redistribución de componentes de NVIDIA CUDA.
- El autor del repositorio no entrena el modelo ni garantiza los pesos: solo aporta runtime, scripts e instrucciones; los pesos provienen de terceros y deben verificarse con los hashes SHA-256 incluidos.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zuraxe/DeepSeek-V4.1-Flash-1017-Uncensored-Native-Vision-Windows
- Licencia (NOTICE.md): https://huggingface.co/zuraxe/DeepSeek-V4.1-Flash-1017-Uncensored-Native-Vision-Windows/blob/main/NOTICE.md
- Pesos principales (AtomicChat, IQ2_XXS): https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF/tree/4f1d2f730cff977961db81789e81bfc0d3e6dd2e
- Tabla Engram (ISTA-DASLab, IQ4_NL): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF/resolve/65d53bc8be65123e255ff02f3ded958b6dbf54fd/DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf
- Proyector de visión (ISTA-DASLab, BF16): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF/resolve/65d53bc8be65123e255ff02f3ded958b6dbf54fd/mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf
- Fichero MTP/visión (IndrasMirror, Q2_K): https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored/resolve/ed44acec8175a06485c55f0f8915fb57eea9d7ee/V41-MTP-Vision-1017.Q2_K.gguf
- Paquete completo vía torrent (Renderoverse): https://renderoverse.com/model/deepseek-v41-flash-1017-native-vision-windows
- Python 3.12 x64: https://www.python.org/downloads/windows/
- Controladores NVIDIA: https://www.nvidia.com/Download/index.aspx
- Runtime de Visual C++ x64: https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist
