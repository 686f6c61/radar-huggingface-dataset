# uran1um1/tenorio-1.5b

## Resumen

Tenorio 1.5b es un modelo de lenguaje de pequeno tamano desarrollado por el autor uran1um1 como parte de la familia Tenorio. Se trata de un fine tune del modelo Qwen2.5-1.5B-Instruct de Alibaba, orientado a mejorar la competencia en espanol y el formato de las respuestas. El objetivo principal es obtener respuestas en espanol con mayor correccion gramatical, naturalidad y un uso mas consistente de Markdown.

El modelo tiene aproximadamente 1.543 millones de parametros (1.54B) y utiliza una arquitectura transformer decoder-only heredada de Qwen2.5. El repositorio contiene los pesos en formato safetensors. Se trata de un proyecto aficionado, por lo que el propio autor advierte que los resultados no estan garantizados. Es la segunda version de la familia, tras Tenorio 0.6b, y su relevancia radica en aplicar tecnicas de continuacion del preentrenamiento y ajuste fino con LoRA para adaptar un modelo pequeno a un idioma especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1.54B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Espanol, ingles |
| Licencia | MIT (modificaciones del fine tune) / Apache 2.0 (modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine tune de Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El proceso de entrenamiento consta de dos etapas. Primero, se realizo una continuacion del preentrenamiento (CPT) sobre mas de 100 libros de dominio publico en espanol. Despues, se aplico un ajuste de instrucciones mediante LoRA con 7.077 pares de preguntas y respuestas en espanol, destilados del modelo Bonsai 8b mediante un script automatizado de auto-prompting.

El autor indica que la arquitectura de ajuste es casi identica a la usada en el modelo previo Tenorio 0.6b. No se documentan innovaciones tecnicas destacables como decodificacion especulativa, atencion lineal ni tecnicas propias de MoE. El proyecto se define como un hobby, sin garantias de resultados.

## Capacidades

- Generacion de texto conversacional en espanol e ingles.
- Mejora del formato Markdown en las respuestas en espanol, lo que facilita la presentacion de listas, tablas y estructuras.
- Mayor tendencia a realizar preguntas al usuario y solicitar preferencias durante la conversacion, lo que resulta en interacciones mas dialogicas.
- No se han documentado capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Asistente de soporte al cliente en espanol: el modelo puede gestionar conversaciones multi-turno, presentando instrucciones y soluciones con formato Markdown claro.
- Redaccion de contenidos para blogs y documentacion tecnica: su ajuste en el uso de Markdown permite generar guias, manuales y articulos en espanol con una estructura legible.
- Chatbot educativo para estudiantes de espanol: al formular preguntas al usuario, el modelo favorece practicas interactivas y simulaciones de dialogo.
- Generacion de pares de preguntas y respuestas en espanol: puede usarse para producir datos sinteticos que alimenten el entrenamiento o la evaluacion de otros modelos de idioma.
- Reformulacion y mejora de la naturalidad de textos en espanol: aunque no es un corrector gramatical dedicado, el ajuste linguistico permite reescribir frases con mayor soltura.
- Prototipos ligeros de asistentes virtuales en entornos con recursos limitados: al tener solo 1.54B de parametros, es viable probarlo en GPUs de consumo o CPU mediante cuantizacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. El autor ha creado un mini-benchmark propio con 592 preguntas en espanol, en el que Tenorio 1.5b compite directamente contra el modelo base Qwen2.5-1.5B-Instruct. Las respuestas fueron evaluadas por GPT-OSS 20b atendiendo unicamente a la correccion gramatical y a la naturalidad del espanol.

| Benchmark | Puntuacion (Tenorio) | Puntuacion (Base) |
|---|---|---|
| Espanol (mini-benchmark propio, 592 preguntas) | 315/592 | 277/592 |

Este resultado indica que Tenorio 1.5b supero al modelo base en 315 de las 592 preguntas, frente a 277 del base. No obstante, se trata de una evaluacion no formal y con un unico modelo juez.

## Requisitos de hardware

- VRAM estimada: en precision FP16, el modelo ocupa aproximadamente 3,1 GB, por lo que se necesitan entre 3 y 4 GB de VRAM para inferencia. Con cuantizacion externa a 4 bits, la VRAM requerida puede reducirse a unos 1 GB.
- GPU recomendadas: NVIDIA RTX 3060 o superior para ejecutar en FP16; para 4 bits puede bastar con GPUs de menor capacidad.
- Compatibilidad con GPU de consumo: si se usa cuantizacion 4-bit, puede ejecutarse en tarjetas como RTX 3050, RTX 4060 o similares.
- Opciones de despliegue: vLLM, Hugging Face TGI y llama.cpp. Tambien es posible integrarlo en Ollama si se convierte previamente al formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en espanol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tenorio 1.5b | 1.54B | No disponible | 315/592 en mini-benchmark propio | MIT (modificaciones) / Apache 2.0 (base) | safetensors en HuggingFace |
| Qwen2.5-1.5B-Instruct | 1.54B | No disponible | 277/592 en mini-benchmark propio | Apache 2.0 | safetensors y GGUF |
| Tenorio 0.6b | No disponible | No disponible | No disponible | MIT / Apache 2.0 | safetensors en HuggingFace |

La comparativa se limita a las dos versiones disponibles de la familia Tenorio y al modelo base. No se dispone de datos de contexto ni de resultados estandar para realizar una comparacion mas amplia con otros modelos pequenos en espanol.

## Limitaciones y advertencias

- Proyecto aficionado del autor, sin garantias de rendimiento, soporte ni mantenimiento.
- No se han realizado benchmarks estandar; el unico resultado proviene de un mini-benchmark propio con un modelo juez automatico que puede introducir sesgos.
- El volumen de datos de entrenamiento es reducido (mas de 100 libros y 7.077 pares) en comparacion con modelos de mayor escala, lo que puede limitar la cobertura de temas y dominios.
- No se ha documentado soporte para tool calling, agentes ni razonamiento complejo, por lo que no es adecuado para estos usos sin verificacion adicional.
- La licencia MIT se aplica a las modificaciones del fine tune, pero el modelo base Qwen2.5-1.5B-Instruct esta bajo Apache 2.0; cualquier uso debe cumplir ambas licencias.
- Existe riesgo de alucinacion, propio de cualquier modelo pequeno actuando sin un sistema de verificacion externa.
- La longitud de contexto no esta especificada en la informacion disponible, lo que requiere pruebas previas antes de usarlo en aplicaciones que necesiten ventanas de contexto largas.

## Enlaces

- Modelo: https://huggingface.co/uran1um1/tenorio-1.5b
- Perfil del autor: https://huggingface.co/uran1um1
- Modelo anterior de la familia: https://huggingface.co/uran1um1/tenorio-0.6b
- Repositorio de datasets del autor: https://huggingface.co/uran1um1/datasets
