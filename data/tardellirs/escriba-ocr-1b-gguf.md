# tardellirs/Escriba-OCR-1B-GGUF

## Resumen

Escriba-OCR-1B-GGUF es la distribucion en formato GGUF del modelo Escriba-OCR-1B, un modelo de vision-lenguaje de aproximadamente 596 millones de parametros (denominado "1B" por el autor) especializado en reconocimiento de texto manuscrito (HTR, por sus siglas en ingles) en redacciones escolares en portugues de Brasil. Lo desarrolla el usuario tardellirs y esta disenado especificamente para preservar los errores ortograficos y gramaticales del alumno en la transcripcion, en lugar de corregirlos, algo poco habitual en sistemas OCR convencionales.

El modelo parte de LightOnOCR-3-1B (LightOn, licencia Apache 2.0) y se ha ajustado sobre el corpus BRESSAY, un conjunto de redacciones manuscritas del examen ENEM. Esta version GGUF esta pensada para ejecutarse en CPU convencional mediante llama.cpp, sin necesidad de GPU, lo que permite procesar redacciones dentro del propio centro escolar sin que las imagenes salgan de la red local. Segun el autor, la cuantizacion Q4_K_M combinada con el proyector visual Q4_K_M ocupa 0,66 GB y mantiene un CER del 2,60 %, practicamente identico al de los pesos originales en vLLM.

La relevancia actual del modelo reside en su enfoque "error-preserving" aplicado a un dominio educativo muy concreto (portugues brasileno, redacciones ENEM) y en su diseno para despliegue en hardware modesto. No obstante, su licencia CC BY-NC 4.0 restringe el uso a fines no comerciales, y su ambito linguistico y de tarea es muy estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (modelo base LightOnOCR-3-1B); pesos en formato GGUF para llama.cpp |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion recomendada en llama-server); contexto de entrenamiento no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 (modelo de lenguaje); Q4_K_M, Q8_0, F16 (proyector visual) |
| Idiomas soportados | Portugues (pt) y portugues de Brasil (segun tags de la model card); lista oficial de idiomas no disponible |
| Licencia | CC BY-NC 4.0 (solo uso no comercial) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de vision-lenguaje: un codificador de imagen (proyector visual, empaquetado como `mmproj-*.gguf`) que convierte la pagina en aproximadamente 1.700 tokens visuales a 1200 px de resolucion, y un modelo de lenguaje que genera la transcripcion. El modelo base es LightOnOCR-3-1B de LightOn, sobre el que se realizo un ajuste especifico para el corpus BRESSAY de redacciones manuscritas del ENEM.

El entrenamiento esta orientado a preservar los errores del alumno (enfoque "error-preserving"), de modo que la salida refleja fielmente lo escrito, incluidas faltas de ortografia y desviaciones gramaticales. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO. La model card indica que la inferencia debe realizarse con configuraciones fijas: redimensionar la pagina a 1200 px en el lado mayor, enviar unicamente la imagen sin prompt de texto y decodificar de forma greedy con `repetition_penalty=1.05`. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` (con `--mmproj` para el proyector) y la cuantizacion con `llama-quantize`; segun el autor, la salida F16 coincide con la salida vLLM de los pesos originales en aproximadamente un 1 % de caracteres.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en redacciones escolares en portugues de Brasil.
- Transcripcion que preserva errores ortograficos y gramaticales del alumno (error-preserving).
- Procesamiento de imagen a texto en un unico paso, sin prompt textual de entrada.
- Ejecucion en CPU mediante llama.cpp, sin GPU.
- Servidor compatible con la API de OpenAI a traves de `llama-server`.
- Integracion con herramientas de linea de comandos y visor local del repositorio `tardellirs/escriba-ocr`.
- Capacidades multilingues: limitadas al portugues (pt / pt-BR) segun la informacion disponible; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Digitalizacion de redacciones escolares en el aula: el modelo transcribe las redacciones manuscritas de los alumnos en un servidor local con CPU, de modo que las imagenes no salen de los equipos del centro. Es adecuado por su bajo consumo de RAM (2,7 GB de pico) y su ejecucion sin GPU.
- Evaluacion pedagogica con preservacion de errores: al mantener las faltas del alumno, el profesorado puede analizar patrones de error ortografico y gramatical sobre la transcripcion sin perder informacion que un OCR corrector eliminaria.
- Preparacion de datos para el examen ENEM: permite convertir lotes de redacciones manuscritas en texto plano para su analisis estadistico o su uso como corpus de investigacion, dado que el modelo esta ajustado sobre BRESSAY.
- Despliegue en infraestructura escolar modesta: con la configuracion Q4_K_M + mmproj Q4_K_M (0,66 GB) puede ejecutarse en un servidor de 4 vCPU y 16 GB de RAM, lo que lo hace viable en centros con recursos limitados.
- Pipeline de correccion asistida: la salida en texto por pagina (un `.txt` por imagen mediante `escriba transcribe`) puede alimentar herramientas posteriores de analisis o revision humana.
- Investigacion en HTR educativo: sirve como referencia para estudiar tecnicas de reconocimiento que preservan errores en lugar de normalizarlos, con resultados de CER medidos sobre el split de test de BRESSAY.
- Visor local de paginas y transcripciones: el comando `escriba viewer` levanta una interfaz web en `http://127.0.0.1:8000` para revisar paginas y transcripciones, util para revision manual en el aula.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 30 paginas aleatorias del split de test de BRESSAY, en una VM de 4 vCPU (AMD EPYC Turin, 16 GB RAM), con llama.cpp compilado con `GGML_NATIVE=ON`, una pagina a la vez. CER insensible a mayusculas, por pagina y acotado al 100 %. Tiempos y velocidades son medianas; la RAM es el pico del servidor sobre las 30 paginas.

| Variante | Archivos (texto + vision) | CER | Tiempo por pagina | Codificacion de imagen | Generacion de texto | RAM pico |
|---|---|---|---|---|---|---|
| Pesos originales, vLLM en GPU (referencia) | 2,0 GB | 2,56 % | 2,3 s | no disponible | no disponible | no disponible |
| F16 + mmproj F16 | 2,0 GB | 2,60 % | 69 s | 41 s | 28 tok/s | 3,6 GB |
| Q8_0 + mmproj Q8_0 | 1,1 GB | 2,60 % | 70 s | 49 s | 38 tok/s | 2,9 GB |
| Q4_K_M + mmproj F16 | 1,2 GB | 2,55 % | 55 s | 37 s | 47 tok/s | 3,0 GB |
| Q4_K_M + mmproj Q8_0 | 0,85 GB | 2,54 % | 66 s | 48 s | 45 tok/s | 2,8 GB |
| Q4_K_M + mmproj Q4_K_M | 0,66 GB | 2,60 % | 53 s | 35 s | 45 tok/s | 2,7 GB |

Segun el autor, las diferencias entre variantes cuantizadas estan dentro de 0,05 puntos, por debajo del ruido entre paginas. Redimensionar a 1000 px en lugar de 1200 px reduce el tiempo en aproximadamente un tercio pero eleva el CER en torno a 0,4 puntos, por lo que no se recomienda. No se han publicado en la informacion disponible resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no aplica para GGUF en CPU; en GPU, los pesos originales en vLLM ocupan 2,0 GB.
- RAM recomendada: 2,7 GB de pico con Q4_K_M + mmproj Q4_K_M; 3,6 GB con la variante F16.
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU. Los pesos originales se ejecutan en vLLM sobre GPU (referencia medida a 2,3 s por pagina).
- Cabe en CPU convencional: si, con la configuracion Q4_K_M + mmproj Q4_K_M (0,66 GB de archivos).
- CPUs sin AVX-512 son mas lentas segun el autor.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`), cliente y visor del repositorio `tardellirs/escriba-ocr`, API compatible con OpenAI. No se documenta soporte de vLLM, TGI ni Ollama para esta version GGUF.
- Latencia y throughput en CPU (4 vCPU AMD EPYC Turin): 53 s por pagina con Q4_K_M + mmproj Q4_K_M, de los cuales 35 s corresponden a codificacion de imagen y la generacion ronda los 45 tok/s.
- Configuracion recomendada del servidor: `--temp 0 --repeat-penalty 1.05 -c 8192 --cache-ram 0 -np 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Escriba-OCR-1B-GGUF | 596 M | 8192 (config. recomendada) | HTR error-preserving pt-BR, CPU | CC BY-NC 4.0 | GGUF en Hugging Face |
| LightOnOCR-3-1B (base) | no disponible | no disponible | OCR general | Apache 2.0 | Hugging Face |
| Pesos originales Escriba-OCR-1B | 596 M | no disponible | HTR error-preserving pt-BR | CC BY-NC 4.0 | Safetensors en Hugging Face |

La informacion disponible no incluye otros modelos OCR comparables con datos de rendimiento medidos sobre BRESSAY, por lo que la comparativa se limita al modelo base y a los pesos originales.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: uso exclusivamente no comercial. El corpus de entrenamiento BRESSAY solo puede usarse para investigacion y docencia no comercial.
- Ambito linguistico restringido al portugues (pt / pt-BR); no se documenta soporte de otros idiomas.
- Disenado especificamente para redacciones manuscritas del ENEM; su rendimiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion y de errores de transcripcion: el CER medido es del 2,54-2,60 % sobre el split de test, no es cero.
- Requiere seguir estrictamente la configuracion de inferencia (1200 px, solo imagen, greedy con `repetition_penalty=1.05`); desviarse puede degradar la calidad.
- En llama-server es necesario `-np 1` y `--cache-ram 0`; con la configuracion por defecto de varios slots, una pagina de aproximadamente 1.700 tokens puede fallar con "failed to find a memory slot", y la cache de prompt puede crecer hasta 8 GB de RAM.
- El rendimiento en CPU depende de AVX-512; CPUs mas antiguas son mas lentas.
- No se documentan sesgos especificos, pero al tratarse de texto manuscrito de estudiantes puede reflejar sesgos presentes en el corpus BRESSAY.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/tardellirs/Escriba-OCR-1B-GGUF
- Modelo base Escriba-OCR-1B: https://huggingface.co/tardellirs/Escriba-OCR-1B
- Modelo base de LightOn: https://huggingface.co/lightonai/LightOnOCR-3-1B
- Paper: https://arxiv.org/abs/2611.29874
- Repositorio de cliente y visor: https://github.com/tardellirs/escriba-ocr
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Corpus BRESSAY: https://zenodo.org/records/11637681
