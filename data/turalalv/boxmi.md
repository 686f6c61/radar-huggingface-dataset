# turalalv/BOXMI

## Resumen

BOXMI es un paquete de modelo multimodal (entrada de texto e imagen, salida de texto) distribuido en formato GGUF y pensado para ejecución local con `llama.cpp`. Lo publica el usuario turalalv en Hugging Face bajo licencia Apache 2.0. El repositorio no contiene pesos en safetensors para uso directo, sino tres cuantizaciones listas para ejecutar, un adaptador LoRA y dos proyectores de visión, con un total de 39,9 GB en el repositorio.

El modelo declara 26.070.385.152 parámetros (aproximadamente 26 mil millones) según los metadatos del repositorio. La arquitectura se etiqueta como «inkling2», con soporte de bucle (loop architecture) que requiere compilaciones recientes de `llama.cpp` (b12600 o superior). Incorpora un adaptador LoRA y una etiqueta «uncensored», lo que sugiere un ajuste orientado a reducir rechazos en las respuestas.

Su relevancia es acotada pero concreta: ofrece un paquete multimodal autocontenido para despliegue local en GGUF, con cuantizaciones de 8,67 GB a 16,53 GB, lo que permite ejecutarlo en hardware de consumo con suficiente VRAM o memoria unificada. La información pública disponible es escasa: no hay model card detallada, ni datos de entrenamiento, ni benchmarks, ni lista de idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | «inkling2» con soporte de bucle (loop architecture); requiere llama.cpp b12600 o superior |
| Parámetros totales | 26.070.385.152 (≈26 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens en el ejemplo de ejecución de la model card (`-c 32768`); máximo no confirmado |
| Tipos de cuantización | IQ2_M (8,67 GB), IQ3_S (13,34 GB), Q4_K (16,53 GB); LoRA en GGUF (43,8 MB); proyectores de visión F16 (639 MB) y BF16 (642 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors |

## Arquitectura y entrenamiento

La información disponible no permite detallar la arquitectura interna más allá de la etiqueta «inkling2» y la mención a una «loop architecture» que exige una compilación específica de `llama.cpp`. Se trata de un modelo multimodal con proyector de visión separado (mmproj), lo que implica un codificador visual acoplado a un modelo de lenguaje mediante un adaptador. El repositorio incluye además un adaptador LoRA en formato GGUF, lo que indica que el paquete se construyó mediante ajuste fino sobre una base compatible, aunque la identidad de esa base no se especifica.

No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas concretas más allá del soporte de bucle en la arquitectura y la etiqueta «uncensored». Tampoco se documenta el proceso de cuantización ni la herramienta empleada, aunque la presencia de la etiqueta «imatrix» sugiere cuantización con matrices de importancia.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta «conversational».
- Entrada de imagen con salida de texto (pipeline `image-text-to-text`), mediante los proyectores `mmproj-BOXMI-F16.gguf` o `mmproj-BOXMI-BF16.gguf`.
- Ejecución local en `llama.cpp` con servidor compatible con la API de endpoints (`endpoints_compatible`).
- Ajuste adicional mediante el adaptador LoRA `BOXMI-LoRA.gguf` sobre una base GGUF compatible.
- Comportamiento «uncensored» declarado por el autor, orientado a reducir rechazos.
- Soporte de plantillas de chat mediante `--jinja` en el servidor de `llama.cpp`.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni audio.

## Casos de uso

- Asistente conversacional local con privacidad total: el modelo se ejecuta íntegramente en la máquina del usuario mediante `llama-server`, sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Análisis de imágenes en escritorio: con el proyector de visión cargado, permite describir o extraer información de capturas, diagramas o fotografías desde una interfaz local, sin depender de API en la nube.
- Prototipado rápido de aplicaciones multimodales: el paquete incluye cuantizaciones de distintos tamaños (8,67 GB a 16,53 GB), lo que permite elegir el equilibrio entre calidad y memoria según el hardware de desarrollo disponible.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización IQ2_M (8,67 GB) cabe en GPUs de 12-16 GB de VRAM, lo que facilita probar un modelo de 26 mil millones de parámetros en hardware asequible.
- Investigación sobre ajuste fino con LoRA: el adaptador `BOXMI-LoRA.gguf` permite estudiar o reutilizar el ajuste sobre una base compatible en flujos de trabajo con `llama.cpp`.
- Experimentación con arquitecturas de bucle: al requerir una compilación específica de `llama.cpp` (b12600 o superior), sirve como banco de pruebas para evaluar el soporte de este tipo de arquitecturas en el ecosistema GGUF.
- Generación de contenido sin filtros en entornos controlados: la orientación «uncensored» puede resultar útil en investigación creativa o redacción técnica donde los rechazos por defecto resultan obstructivos, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB con IQ2_M, 14-15 GB con IQ3_S y 17-18 GB con Q4_K, añadiendo el proyector de visión (639-642 MB) y el espacio para la caché KV según la longitud de contexto.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamaño, una RTX 4090 (24 GB) permite ejecutar Q4_K con contexto amplio; una RTX 4080 o 4070 Ti Super (16 GB) queda ajustada para Q4_K y holgada para IQ3_S; GPUs de 12 GB solo admiten IQ2_M con contexto reducido.
- Cabe en GPU de consumo: sí, al menos la cuantización IQ2_M en GPUs de 12 GB o más; las demás requieren 16 GB o más de VRAM.
- Opciones de despliegue: `llama.cpp` (obligatorio, compilación b12600 o superior con soporte de Inkling 2); `llama-server` con `--jinja -c 32768` según el ejemplo del autor. No se documenta compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de tamaño o tarea similares.

## Limitaciones y advertencias

- Información muy escasa: no hay model card detallada, datos de entrenamiento, idiomas declarados ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Riesgo de alucinación no cuantificado: al no publicarse evaluaciones, no es posible estimar la fiabilidad factual del modelo.
- Etiqueta «uncensored»: implica posible ausencia de filtros de seguridad, con el consiguiente riesgo de generar contenido inapropiado; requiere supervisión y políticas de uso en producción.
- Dependencia de una compilación concreta de `llama.cpp` (b12600 o superior): versiones anteriores no cargarán el modelo, lo que complica la integración en pipelines con versiones fijadas.
- Contexto de 32.768 tokens solo verificado en el ejemplo de ejecución; el máximo real no está confirmado.
- Idiomas soportados no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación sobre la procedencia de los datos de entrenamiento, lo que puede implicar riesgos legales no evaluados.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validación por parte de la comunidad.
- El adaptador LoRA solo funciona sobre una base GGUF compatible no identificada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/turalalv/BOXMI
