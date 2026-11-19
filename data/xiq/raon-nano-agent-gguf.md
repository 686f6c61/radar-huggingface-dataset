# xiq/raon-nano-agent-GGUF

## Resumen

Raon-nano-agent es un modelo de lenguaje de 3.130.811.440 parámetros (aproximadamente 3,13 mil millones) publicado por el usuario xiq en Hugging Face, distribuido en formato GGUF para su uso con llama.cpp. Se trata de un ajuste fino del modelo base `xiq/Raon-1-nano-heretic`, sobre el que se han fusionado cuatro LoRAs entrenadas para tareas de agente: control de interfaz de Android a partir del árbol de accesibilidad textual, navegación web (a partir de Mind2Web), conversación en persa y descompilación de ensamblador a C. La escala de fusión elegida, 0,75, se seleccionó sobre filas no vistas durante el entrenamiento.

El modelo se presenta explícitamente como experimental y su propia model card advierte de que las métricas publicadas miden principalmente la capacidad de aprender formatos de salida (JSON estructurado para acciones de agente), no la calidad frente a otros agentes del mercado. La licencia es Apache 2.0 y el repositorio ocupa 11,7 GB, lo que sugiere la publicación de varias cuantizaciones GGUF del mismo modelo.

Su relevancia actual es acotada y muy específica: cubre un nicho poco atendido (agentes móviles y web con salida JSON estricta, más descompilación asistida) sobre una arquitectura que requiere una rama no mainline de llama.cpp (la de KRAFTON, etiqueta `raon-1-nano-preview`), lo que limita su adopción directa en producción sin trabajo adicional de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `xiq/Raon-1-nano-heretic`; requiere la rama `raon-1-nano-preview` de llama.cpp de KRAFTON, lo que indica una arquitectura no soportada por llama.cpp mainline) |
| Parametros totales | 3.130.811.440 (aproximadamente 3,13 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (valor usado en el ejemplo de ejecución con `--ctx-size 16384`; no se especifica el máximo soportado) |
| Tipos de cuantizacion | GGUF; se menciona explícitamente Q4_K_M en el ejemplo de ejecución, sin listado completo de variantes |
| Idiomas soportados | no disponibles oficialmente; el entrenamiento incluye datos de chat en persa (traducidos automáticamente) y datos en inglés de AndroidControl y Mind2Web |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 11,7 GB); el modelo base se distribuye en safetensors según los metadatos |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base en la información disponible. El hecho de que la model card indique que llama.cpp mainline no puede cargar esta arquitectura y remita a una rama específica de KRAFTON (`raon-1-nano-preview`) sugiere una variante de transformer no estándar, pero no se confirma el tipo exacto (transformer denso, híbrido, SSM u otro).

El entrenamiento consiste en la fusión de cuatro LoRAs sobre el modelo base, con una escala de fusión de 0,75 elegida mediante evaluación sobre filas no vistas. Los datos de cada LoRA son: AndroidControl convertido a filas de chat para control de UI Android; osunlp/Mind2Web (split de entrenamiento) convertido a filas de chat para agente de navegación web; xmanii/Maux-Persian-SFT-30k (traducido automáticamente) para chat en persa; y LLM4Binary/decompile-bench para descompilación de ensamblador a C. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. Las LoRAs se entrenaron con el modo de razonamiento desactivado, por lo que el modelo debe ejecutarse con `--reasoning off` (`enable_thinking=false`).

## Capacidades

- Generación de texto conversacional, con soporte declarado de chat multi-turno.
- Control de interfaz de Android: genera acciones estructuradas en JSON a partir de un árbol de accesibilidad textual.
- Agente de navegación web: produce acciones JSON (tipo de acción, elemento objetivo) a partir de observaciones de página, entrenado con Mind2Web.
- Chat en persa, aunque con calidad experimental y regresión medida en la proporción de caracteres en persa.
- Descompilación de ensamblador a código C, con salida plausible pero no verificada como compilable.
- Salida en JSON crudo: en las evaluaciones, el 100 % de las generaciones en Android y web fueron JSON puro tras la fusión.
- No se documenta soporte de tool calling genérico, function calling estándar, visión, audio ni modo de razonamiento (de hecho, el thinking debe desactivarse).

## Casos de uso

- Automatización de pruebas de UI en Android: el modelo puede generar acciones JSON (clic, entrada de texto, desplazamiento) a partir del árbol de accesibilidad, lo que permite construir agentes de test que operen sobre la jerarquía de vistas en lugar de coordenadas; su precisión en el elemento objetivo es baja (aproximadamente 9 %), por lo que encaja mejor como generador de candidatos que como controlador autónomo.
- Agente de navegación web supervisado: con un 50 % de coincidencia exacta en las filas evaluadas y un 90 % de acierto en el tipo de acción, es adecuado para prototipos de scraping guiado o asistentes de formularios donde un humano valide la acción propuesta.
- Extracción estructurada de acciones en pipelines de automatización: al producir JSON crudo de forma consistente, puede integrarse como paso intermedio que transforma observaciones textuales en comandos parseables por un orquestador.
- Asistencia a la descompilación en análisis de malware o ingeniería inversa: dado un fragmento de ensamblador, genera C legible como punto de partida para un analista; la F1 de tokens de código medida es de 19,12, por lo que requiere revisión manual obligatoria.
- Prototipado de asistentes en persa: útil para experimentación con conversación en ese idioma, siempre que se acepte que la proporción de respuestas en persa bajó al 61,48 % tras la fusión y que la superposición de palabras con la referencia es de aproximadamente el 11 %.
- Investigación sobre fusión de LoRAs: el repositorio incluye un informe de benchmarks (`bench_report.json`) con comparativas base frente a fusionado sobre filas no vistas, lo que lo convierte en un caso de estudio reproducible para quienes investigan técnicas de merge de adaptadores.

## Benchmarks y rendimiento

Los datos provienen de la model card y comparan el modelo base `xiq/Raon-1-nano-heretic` con el modelo fusionado, ambos en bf16 desde los pesos de Hugging Face, con thinking desactivado y decodificación greedy, sobre filas no vistas durante el entrenamiento.

### Control de UI Android (40 filas generadas)

| Métrica | Base | Fusionado | Cambio |
|---|---:|---:|---:|
| Pérdida en held-out | 3,38 | 0,32 | -3,06 |
| JSON crudo únicamente (%) | 0,00 | 100,00 | +100,00 |
| Tipo de acción correcto (%) | 0,00 | 62,50 | +62,50 |
| Elemento objetivo correcto (%) | 0,00 | 9,09 | +9,09 |
| Coincidencia exacta (%) | 0,00 | 10,00 | +10,00 |

### Agente de navegación web (40 filas generadas)

| Métrica | Base | Fusionado | Cambio |
|---|---:|---:|---:|
| Pérdida en held-out | 3,89 | 0,22 | -3,67 |
| JSON crudo únicamente (%) | 17,50 | 100,00 | +82,50 |
| Tipo de acción correcto (%) | 30,00 | 90,00 | +60,00 |
| Elemento objetivo correcto (%) | 0,00 | 57,50 | +57,50 |
| Coincidencia exacta (%) | 0,00 | 50,00 | +50,00 |

### Chat en persa (8 filas generadas)

| Métrica | Base | Fusionado | Cambio |
|---|---:|---:|---:|
| Pérdida en held-out | 1,63 | 1,01 | -0,62 |
| Respuesta en persa (%) | 96,16 | 61,48 | -34,68 |
| F1 de palabras frente a referencia (%) | 9,07 | 10,96 | +1,89 |
| Palabras medias | 19,25 | 17,00 | -2,25 |

### Descompilación de ensamblador a C (8 filas generadas)

| Métrica | Base | Fusionado | Cambio |
|---|---:|---:|---:|
| Pérdida en held-out | 3,15 | 1,55 | -1,60 |
| Similitud de caracteres (%) | 9,67 | 11,02 | +1,34 |
| F1 de tokens de código (%) | 13,35 | 19,12 | +5,77 |

Advertencias del propio autor: el modelo base nunca fue entrenado en estos formatos de salida, por lo que gran parte de la mejora en JSON refleja el aprendizaje del formato y no la calidad frente a otros agentes; las muestras son pequeñas (40 filas en Android y web, 8 en persa y descompilación); Android es débil (el elemento objetivo solo se acierta en torno al 9 %, con frecuente recurso a clics por coordenadas); persa empeora en una métrica; y las filas de Android y web provienen de los mismos datasets de entrenamiento (posiblemente los mismos episodios o sitios), por lo que esas cifras son optimistas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,13 mil millones de parámetros, en Q4_K_M el peso ronda los 1,9-2,0 GB; con contexto de 16.384 tokens hay que sumar la caché KV, que depende de la arquitectura (no disponible). En bf16 el peso completo ocupa aproximadamente 6,3 GB, más caché KV.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM libre debería poder ejecutar la cuantización Q4_K_M, y una GPU de 8-12 GB permite contextos largos y mayor paralelismo.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas tipo RTX 3060, RTX 4060 o superiores con la cuantización Q4_K_M; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, obligatoriamente desde la rama `raon-1-nano-preview` de KRAFTON (`git clone -b raon-1-nano-preview https://github.com/krafton-ai/llama.cpp`), compilando con `-DGGML_CUDA=ON` para GPU. Se usan `llama-cli` y `llama-server`; llama.cpp mainline no carga la arquitectura. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas por el autor frente a otros modelos. Como referencia de categoría, se comparan alternativas de tamaño similar (aproximadamente 3 mil millones de parámetros) orientadas a agentes o a despliegue en dispositivos:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| xiq/raon-nano-agent | 3,13 mil M | 16.384 (usado en el ejemplo) | Apache 2.0 | GGUF | Requiere rama no mainline de llama.cpp; benchmarks solo frente a su base |
| Qwen2.5-3B-Instruct | 3,09 mil M | 32.768 | Apache 2.0 | safetensors, GGUF | Soporte amplio en llama.cpp, vLLM y Ollama; sin entrenamiento específico de agente móvil |
| Llama-3.2-3B-Instruct | 3,21 mil M | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Mayor contexto; licencia con restricciones para grandes empresas |
| Phi-3.5-mini-instruct | 3,82 mil M | 131.072 | MIT | safetensors, GGUF | Enfoque en razonamiento y código; sin capacidades de agente de UI |

Los datos de parámetros y contexto de los modelos comparados son de conocimiento general y no provienen de la información proporcionada sobre este modelo; el rendimiento relativo no está disponible porque el autor no publica comparaciones cruzadas.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el propio autor advierte de que las métricas miden principalmente el aprendizaje de formatos de salida frente a un base que producía texto degenerado o en bucle.
- Android es débil: el tipo de acción se acierta en torno al 62,5 % de los casos, pero el elemento objetivo solo en aproximadamente el 9 %, con recurso frecuente a clics por coordenadas.
- Persa con regresión: la proporción de respuestas en persa cayó del 96,16 % al 61,48 % y la superposición de palabras con la referencia es de aproximadamente el 11 %; el autor recomienda tratarlo como experimental.
- Descompilación no verificada: la salida es C plausible pero no se comprueba que compile ni que reproduzca el comportamiento del binario original.
- Riesgo de alucinación: elevado en tareas generativas abiertas, especialmente en persa y descompilación, dado el bajo F1 medido.
- Sesgos: no documentados; los datos de persa son traducciones automáticas, lo que puede introducir artefactos de traducción, y los de Android y web provienen de datasets públicos concretos con posible sesgo de dominio.
- Muestras de evaluación pequeñas (8 filas en persa y descompilación), lo que hace que una sola fila mueva la métrica 12,5 puntos.
- Optimismo en las cifras de Android y web: las filas de evaluación provienen de los mismos datasets de entrenamiento, posiblemente con los mismos episodios o sitios.
- Restricciones de despliegue: no funciona con llama.cpp mainline; requiere la rama de KRAFTON, lo que complica el mantenimiento, la integración en producción y el soporte de otros motores como vLLM u Ollama.
- El modo de razonamiento debe desactivarse (`--reasoning off`), por lo que no se aprovecha el thinking del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y la calidad experimental desaconsejan su uso en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiq/raon-nano-agent-GGUF
- Modelo base: https://huggingface.co/xiq/Raon-1-nano-heretic
- Rama de llama.cpp de KRAFTON: https://github.com/krafton-ai/llama.cpp (rama `raon-1-nano-preview`)
- Dataset Mind2Web (osunlp): https://huggingface.co/datasets/osunlp/Mind2Web
- Dataset Maux-Persian-SFT-30k (xmanii): https://huggingface.co/datasets/xmanii/Maux-Persian-SFT-30k
- Dataset decompile-bench (LLM4Binary): https://huggingface.co/datasets/LLM4Binary/decompile-bench
- Dataset AndroidControl: no disponible enlace directo en la información proporcionada
- Informe de benchmarks: `bench_report.json` dentro del repositorio del modelo
