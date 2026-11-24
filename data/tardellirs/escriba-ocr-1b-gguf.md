# tardellirs/Escriba-OCR-1B-GGUF

## Resumen

Escriba-OCR-1B-GGUF es la distribucion en formato GGUF de Escriba-OCR-1B, un modelo vision-lenguaje de aproximadamente 596 millones de parametros (etiquetado comercialmente como "1B") especializado en el reconocimiento de texto manuscrito (HTR/OCR) de redacciones en portugues, concretamente ensayos escritos a mano por estudiantes para el examen ENEM de Brasil. Lo desarrolla el usuario tardellirs y se distribuye bajo licencia CC BY-NC 4.0. Su rasgo definitorio es que preserva los errores del alumno en la transcripcion, en lugar de corregirlos, lo que lo hace util para evaluacion educativa.

La relevancia de esta version GGUF es practica: permite ejecutar el modelo en CPU convencional mediante llama.cpp, sin GPU, de modo que las redacciones de los estudiantes no tienen que salir de los ordenadores del centro educativo. Los ficheros cuantizados reducen el modelo a entre 0,66 GB y 2,0 GB en disco (incluyendo el proyector de vision), con una calidad de transcripcion equivalente a los pesos originales segun las mediciones del autor.

El modelo se construye sobre LightOnOCR-3-1B (© LightOn, Apache 2.0) y se entrena con el corpus BRESSAY. Esta ficha cubre la variante GGUF; los detalles completos de entrenamiento y benchmarks remiten a la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text); transformer con proyector de vision, derivada de LightOnOCR-3-1B |
| Parametros totales | 596.049.920 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servidor recomendada (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 (modelo); Q4_K_M, Q8_0, F16 (proyector de vision) |
| Idiomas soportados | Portugues (pt), portugues de Brasil; no se declaran otros idiomas |
| Licencia | CC BY-NC 4.0 (solo uso no comercial) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un vision-lenguaje de tipo image-text-to-text que combina un codificador de vision con un modelo de lenguaje y un proyector multimodal, partiendo de la base LightOnOCR-3-1B. La inferencia procesa la imagen de la pagina (redimensionada a 1200 px en el lado mayor, lo que genera aproximadamente 1700 tokens visuales) y produce la transcripcion como texto generado de forma autorregresiva.

El entrenamiento se realizo sobre el corpus BRESSAY, un conjunto de redacciones manuscritas en portugues, con el objetivo explicito de preservar los errores ortograficos y gramaticales del estudiante. La model card de esta variante GGUF no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos corresponden a la model card del modelo base. La innovacion principal no es arquitectonica sino de objetivo: una transcripcion fiel y con errores conservados, orientada a evaluacion educativa.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imagenes de redacciones en portugues.
- Transcripcion que preserva errores del alumno (error-preserving), en lugar de normalizar o corregir.
- Entrada exclusivamente de imagen, sin prompt de texto: el modelo espera solo la imagen de la pagina.
- Salida de texto plano con la transcripcion de la pagina.
- Ejecucion en CPU sin GPU mediante llama.cpp, con API compatible con OpenAI a traves de `llama-server`.
- Procesamiento pagina a pagina, con decodificacion greedy (`--temp 0`, `repetition_penalty=1.05`).
- Soporte de cuantizacion de 4, 5, 6, 8 y 16 bits tanto del modelo como del proyector de vision.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo "thinking".

## Casos de uso

- Digitalizacion de redacciones del ENEM en centros educativos: el modelo transcribe las redacciones manuscritas en un servidor local con CPU, de modo que los documentos de los alumnos no salen de la red del centro.
- Evaluacion pedagogica con errores conservados: al mantener las faltas del estudiante, el profesorado puede analizar patrones de error ortografico y gramatical sin que el OCR los enmascare.
- Despliegue en aulas con hardware modesto: con Q4_K_M + proyector Q4_K_M (0,66 GB, unos 2,7 GB de RAM pico) funciona en un equipo de escritorio convencional, sin GPU.
- Correccion asistida por lotes: el cliente `escriba transcribe photos/ --name class-3a` genera un `.txt` por imagen, lo que permite procesar una clase completa y volcar las transcripciones a un pipeline de evaluacion.
- Revision y verificacion manual: el visor local (`escriba viewer`) permite comparar pagina e transcripcion en el navegador para auditar resultados.
- Archivo y conservacion documental: transcripcion masiva de examenes manuscritos para su indexacion y busqueda posterior.
- Investigacion en HTR educativo: uso del modelo como linea base para estudios sobre reconocimiento de escritura manuscrita en portugues con preservacion de errores.

## Benchmarks y rendimiento

El autor publica mediciones sobre 30 paginas aleatorias del split de test de BRESSAY, en una VM de 4 vCPU (AMD EPYC Turin, 16 GB RAM) con llama.cpp compilado con `GGML_NATIVE=ON`. CER insensible a mayusculas, por pagina y limitado al 100%.

| Variante | Ficheros (texto + vision) | CER | Tiempo por pagina | Codificacion de imagen | Generacion de texto | RAM pico |
|---|---|---|---|---|---|---|
| Pesos originales, vLLM en GPU (referencia) | 2,0 GB | 2,56% | 2,3 s | no disponible | no disponible | no disponible |
| F16 + mmproj F16 | 2,0 GB | 2,60% | 69 s | 41 s | 28 tok/s | 3,6 GB |
| Q8_0 + mmproj Q8_0 | 1,1 GB | 2,60% | 70 s | 49 s | 38 tok/s | 2,9 GB |
| Q4_K_M + mmproj F16 | 1,2 GB | 2,55% | 55 s | 37 s | 47 tok/s | 3,0 GB |
| Q4_K_M + mmproj Q8_0 | 0,85 GB | 2,54% | 66 s | 48 s | 45 tok/s | 2,8 GB |
| Q4_K_M + mmproj Q4_K_M | 0,66 GB | 2,60% | 53 s | 35 s | 45 tok/s | 2,7 GB |

Las diferencias de CER entre cuantizaciones son de 0,05 puntos o menos, dentro del ruido entre paginas. Redimensionar a 1000 px en lugar de 1200 px reduce el tiempo en aproximadamente un tercio, pero eleva el CER en torno a 0,4 puntos, por lo que el autor no lo recomienda. No se publican resultados de MMLU, HumanEval ni GSM8K para este modelo.

## Requisitos de hardware

- VRAM: no aplica en la configuracion recomendada; la inferencia es en CPU. RAM pico medida entre 2,7 GB (Q4_K_M + mmproj Q4_K_M) y 3,6 GB (F16 + mmproj F16).
- GPU recomendadas: no requeridas. La referencia de calidad se obtuvo con vLLM en GPU (2,3 s por pagina), pero la model card no especifica el modelo de GPU.
- Cabe en hardware de consumo: si, en cualquier CPU moderna; el propio modelo esta pensado para ejecutarse sin GPU. Las CPU sin AVX-512 son mas lentas.
- Opciones de despliegue: `llama-server` (API compatible con OpenAI), `llama-mtmd-cli` (linea de comandos) y el cliente/visor `escriba` (repositorio github.com/tardellirs/escriba-ocr). No se documenta soporte para vLLM, TGI ni Ollama en esta variante.
- Latencia y throughput medidos en 4 vCPU: entre 53 y 70 s por pagina segun variante; generacion de texto de 28 a 47 tok/s; la mayor parte del tiempo se consume en la codificacion de la imagen (35 a 49 s).
- Configuracion de servidor recomendada: `--temp 0 --repeat-penalty 1.05 -c 8192 --cache-ram 0 -np 1`; `--cache-ram 0` evita que la cache de prompt crezca hasta 8 GB y `-np 1` evita el error "failed to find a memory slot" al dividirse el contexto en varios slots.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Escriba-OCR-1B-GGUF | 596 M | 8192 | GGUF / llama.cpp en CPU | CC BY-NC 4.0 | Especializado en HTR de portugues con preservacion de errores |
| LightOnOCR-3-1B | no disponible | no disponible | safetensors | Apache 2.0 | Modelo base de Escriba; uso general de OCR, no especifico de portugues educativo |
| Escriba-OCR-1B (original) | 596 M | no disponible | safetensors / vLLM en GPU | CC BY-NC 4.0 | Pesos de referencia; requiere GPU y ofrece 2,3 s por pagina |

No se dispone en la informacion proporcionada de otros modelos comparables de HTR para portugues con preservacion de errores.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: uso exclusivamente no comercial. Los datos de entrenamiento (BRESSAY) solo pueden usarse para investigacion y docencia no comerciales, lo que restringe cualquier despliegue productivo comercial.
- Ambito linguistico limitado al portugues (de Brasil); no se declaran capacidades multilingues.
- Entrenado especificamente con redacciones manuscritas del ENEM; el rendimiento fuera de ese dominio (otra caligrafia, otros formatos, otras lenguas) no esta documentado.
- Riesgo de error de transcripcion: el CER de referencia es de aproximadamente 2,5% a 2,6%, por lo que la salida no debe considerarse exacta sin revision.
- La preservacion de errores es intencionada: el modelo no corrige ortografia ni gramatica, lo que lo hace inadecuado para tareas que requieran texto normalizado.
- Requiere seguir estrictamente la configuracion de entrenamiento (imagen a 1200 px en el lado mayor, solo imagen sin prompt, decodificacion greedy con `repetition_penalty=1.05`); desviarse de ella puede degradar la calidad.
- En CPU sin AVX-512 el rendimiento es notablemente inferior; la latencia de 53 a 70 s por pagina limita su uso en escenarios de alto volumen en tiempo real.
- No se documentan sesgos especificos, pero al derivar de un modelo base y de un corpus educativo concreto puede heredar sesgos de ambos.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no debe emplearse como modelo generalista.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/tardellirs/Escriba-OCR-1B-GGUF
- Modelo base (pesos originales): https://huggingface.co/tardellirs/Escriba-OCR-1B
- Modelo base de LightOn: https://huggingface.co/lightonai/LightOnOCR-3-1B
- Repositorio del cliente y visor escriba-ocr: https://github.com/tardellirs/escriba-ocr
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset BRESSAY: https://zenodo.org/records/11637681
- Logotipo del modelo: https://huggingface.co/tardellirs/Escriba-OCR-1B-GGUF/resolve/main/assets/escriba-logo.png
