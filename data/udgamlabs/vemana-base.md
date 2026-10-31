# udgamlabs/Vemana-Base

## Resumen

Vemana-Base es un modelo lingüístico base de 278 millones de parámetros entrenado desde cero específicamente para telugu por Udgam Labs. Se trata de un modelo pequeño (SLM) entrenado sobre 5.100 millones de tokens únicos de texto web público en telugu, leídos unas 2,4 veces (12.000 millones de posiciones de token), con un tokenizador propio de 32.000 tokens diseñado para esta lengua. Su objetivo es resolver un problema real: los modelos generales pequeños rinden mal en telugu, y Vemana demuestra que un modelo especializado de 278M puede superar a modelos generales abiertos de hasta 1.000 millones de parámetros en la predicción de texto telugu reciente.

Su relevancia radica en los resultados medidos: en páginas de Wikipedia en telugu creadas después del entrenamiento de los modelos comparados, Vemana-Base obtiene 0,361 bits por byte, mejor que nanochat-telugu-560M (el doble de tamaño), Dhee-Pravega-OG Atom, Pothana Base v2, Goldfish Telugu e incluso Gemma-3-1B. Además, es lo bastante ligero para ejecutarse en una CPU de portátil (unos 65 tokens por segundo en la CPU de un Mac mini), lo que lo hace ideal para despliegues locales sin GPU.

Es importante subrayar que es un modelo base: continúa texto en telugu con gran fluidez, pero no sigue instrucciones ni ha recibido ajuste de seguridad. Requiere transformers 5.19 o superior (disposición de texto Gemma 4) y su ventana de contexto entrenada es de 1.024 tokens (unos 570 palabras en telugu).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gemma4_text (layout de texto de Gemma 4, transformer causal) |
| Parámetros totales | 278.214.162 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (unos 570 palabras telugu) |
| Tipos de cuantizacion | no disponible (existe versión GGUF para llama.cpp) |
| Idiomas soportados | Telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,1 GB); también GGUF en repositorio aparte |

## Arquitectura y entrenamiento

Vemana-Base emplea la arquitectura de texto de Gemma 4 (gemma4_text) como transformer causal para generación de texto. El tokenizador es propio, con un vocabulario de 32.000 tokens optimizado para telugu, lo que evita la ineficiencia de tokenizadores multilingües genéricos con escrituras brahmicas. No se trata de un modelo destilado ni ajustado: fue entrenado desde cero.

Los datos de entrenamiento proceden de tres corpus públicos: Sangraha de AI4Bharat (la parte en telugu verificada por humanos), FineWeb-2 de Hugging Face y HPLT 3.0. El texto se filtró por escritura telugu y longitud, se eliminaron casi-duplicados entre los tres corpus y se excluyeron las páginas de test (septiembre-octubre) y los conjuntos de evaluación tipo test. El total asciende a 5.100 millones de tokens únicos. El entrenamiento se realizó en una única H100 durante unas 16 horas (aproximadamente 69 dólares de coste de cómputo, según el informe técnico), procesando 12.000 millones de posiciones de token (unas 2,4 épocas efectivas). No hay mención de RLHF ni DPO, coherente con su naturaleza de modelo base. Se publican todos los checkpoints intermedios en un repositorio dedicado.

## Capacidades

- Continuación de texto fluido en telugu: genera prosa coherente y gramatical en temas como salud, tecnología o agricultura, con muestreo (temperature 0,8, top_p 0,95).
- Modelado lingüístico de alta calidad: mejor bits por byte que todos los modelos base abiertos por debajo de 1B probados en texto telugu reciente.
- No soporta seguimiento de instrucciones: es un modelo base que solo continúa texto.
- No dispone de tool calling ni function calling.
- No tiene capacidades de visión, audio ni modo de razonamiento (thinking).
- Sin ajuste de seguridad ni alineamiento.
- Ejecución eficiente en CPU de clase portátil (unos 65 tokens/s en Mac mini).

## Casos de uso

- Autocompletado y asistencia de escritura en telugu: puede integrarse en editores de texto o teclados móviles para sugerir continuaciones en tiempo real, ya que corre en CPU con baja latencia (65 tokens/s en Mac mini).
- Generación de contenido divulgativo en telugu: partiendo de un titular o primer párrafo, produce texto continuado sobre salud, tecnología o actualidad, útil para medios locales o blogs.
- Investigación en NLP para lenguas de bajos recursos: al publicar todos los checkpoints y el código en GitHub, sirve como base reproducible para estudios de tokenización, escalado y entrenamiento monolingüe.
- Modelo base para fine-tuning: su tamaño de 278M permite ajustar posteriormente con SFT/DPO para tareas concretas (clasificación, resumen, diálogo) con presupuestos de cómputo modestos.
- Despliegue offline en dispositivos de gama baja: con GGUF para llama.cpp, puede ejecutarse en portátiles y equipos sin GPU, adecuado para zonas con conectividad limitada en Andhra Pradesh o Telangana.
- Evaluación comparativa de tokenizadores: su tokenizador de 32.000 tokens específico para telugu permite estudiar la compresión de texto frente a tokenizadores multilingües.
- Corrección y suavizado de texto OCR en telugu: como modelo de lenguaje puro, puede puntuar y reescribir transcripciones ruidosas procedentes de digitalización de documentos.

## Benchmarks y rendimiento

Bits por byte (menor es mejor) en páginas de Wikipedia en telugu creadas tras el lanzamiento de los modelos comparados. Medición de los autores, 27 de octubre de 2026, float32, ventana de 1.024 tokens (512 para Goldfish, su límite):

| Modelo | Parámetros | Sep-Oct 2026 (416 págs.) | Jul-Ago 2026 (477 págs.) | 23-26 Oct 2026 (29 págs.) |
|---|---|---|---|---|
| **Vemana-Base** | 278M | **0,361** | **0,385** | **0,346** |
| nanochat-telugu-560M | 561M | 0,383 | 0,408 | 0,364 |
| Dhee-Pravega-OG Atom | 646M | 0,393 | 0,414 | 0,371 |
| Pothana Base v2 | 222M (370M con bloques compartidos) | 0,440 (0,426 en su vocabulario) | 0,456 (0,444) | 0,425 (0,410) |
| Goldfish Telugu 1000mb | 125M | 0,458 | 0,480 | 0,435 |
| Gemma-3-1B | 1,0B | 0,484 | 0,502 | 0,441 |
| Qwen3.5-0.8B-Base | 0,87B | 0,584 | no disponible | no disponible |
| Gemma-3-270m | 268M | 0,585 | no disponible | no disponible |
| Qwen3-0.6B-Base | 0,6B | 0,692 | no disponible | no disponible |

La ventaja frente a nanochat-telugu-560M es de −0,022 bits por byte (intervalo bootstrap del 95%: [−0,024, −0,021]) en las páginas de septiembre-octubre, y se mantiene con ventana de 512 tokens (−0,017) y excluyendo al editor autor de un tercio de dichas páginas (−0,023). Los autores fijaron el test, el margen de victoria y los chequeos de robustez antes del entrenamiento.

Tests de opción múltiple (lm-eval 0.4.13, 0-shot):

| Test | Resultado | Azar |
|---|---|---|
| Belebele-te | 25,1% | 25% |
| MILU-te | 25,3% (forma cloze: 30,2%) | 25% |
| IndicXNLI-te | 35,0% | 33% |
| IndicCOPA-te | 58,4% (≈55% alcanzable por longitud de respuesta) | 50% |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo ocupa 1,1 GB en safetensors; cabe con holgura en cualquier GPU moderna e incluso en RAM de portátil. No requiere GPU.
- GPU recomendadas: ninguna necesaria; el modelo está diseñado para CPU. Para entrenamiento, los autores usaron una única NVIDIA H100 (16 horas).
- Consumer GPU: cabe sobradamente en cualquier GPU desde 4 GB de VRAM (por ejemplo, GTX 1650 o superior), aunque la ejecución en CPU ya es plenamente viable.
- Opciones de despliegue: transformers 5.19 o superior (AutoModelForCausalLM), llama.cpp mediante la versión GGUF oficial (udgamlabs/Vemana-Base-GGUF), demo en Hugging Face Spaces y demo en navegador en la web del autor. No hay mención de vLLM, TGI ni Ollama.
- Latencia y throughput: unos 65 tokens por segundo en la CPU de un Mac mini; no hay datos publicados para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/byte (telugu, Sep-Oct 2026) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vemana-Base | 278M | 1.024 | 0,361 | Apache 2.0 | safetensors + GGUF, checkpoints completos |
| nanochat-telugu-560M | 561M | no disponible | 0,383 | no disponible | no disponible |
| Goldfish Telugu 1000mb | 125M | 512 | 0,458 | no disponible | no disponible |
| Gemma-3-1B | 1,0B | no disponible | 0,484 | Gemma (restricciones propias) | pesos abiertos |
| Sarvam-1 | 2,5B | no disponible | 0,356 (Sep-Oct) / 0,365 (Jul-Ago) | no disponible | no disponible |

Vemana supera a todos los modelos abiertos por debajo de 1B en modelado de telugu reciente, pero Sarvam-1, unas 9 veces mayor, queda a la par o por delante, lo que marca el techo actual de esta categoría de tamaño.

## Limitaciones y advertencias

- Tendencia a inventar hechos: ante el prompt "తెలుగు భాష" escribió con fluidez que el Día de la Lengua Telugu se celebra el 21 de septiembre, cuando es el 29 de agosto. No debe usarse como fuente de datos fácticos.
- Degeneración en textos largos: ante un prompt de relato corto, repite la misma frase con pequeñas variaciones, perdiendo el hilo narrativo.
- Conocimiento y razonamiento al nivel del azar: los tests de opción múltiple (Belebele, MILU) están en el 25%, como la mayoría de modelos abiertos por debajo de 1B.
- Es un modelo base: no responde preguntas, no sigue instrucciones y no tiene ningún ajuste de seguridad, por lo que puede generar contenido inadecuado sin filtros.
- Contexto corto: 1.024 tokens (unos 570 palabras telugu); no apto para documentos largos.
- Monolingüe: solo telugu; no sirve para otros idiomas ni para tareas multilingües.
- Los modelos mayores lo superan: Sarvam-1 (2,5B) iguala o mejora sus resultados en bits por byte.
- Requiere transformers 5.19 o superior, lo que puede exigir actualizar entornos existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/udgamlabs/Vemana-Base
- Versión GGUF para llama.cpp: https://huggingface.co/udgamlabs/Vemana-Base-GGUF
- Todos los checkpoints: https://huggingface.co/udgamlabs/Vemana-Checkpoints
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Vemana
- Demo en navegador: https://udgamlabs.com/models/vemana#try
- Página del modelo: https://udgamlabs.com/models/vemana
- Informe técnico: https://udgamlabs.com/research/vemana
- Código en GitHub: https://github.com/udgamlabs/vemana
