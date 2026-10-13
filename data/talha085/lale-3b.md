# talha085/Lale-3B

## Resumen

Lale-3B es un ajuste fino del modelo Qwen2.5-3B-Instruct con 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), publicado por el usuario talha085 en HuggingFace bajo licencia Apache-2.0. El modelo funciona como asistente de asuntos estudiantiles de la ficticia Lale Teknik Üniversitesi y responde en turco a preguntas sobre matrícula, selección de asignaturas, exámenes y servicios de campus. La arquitectura de partida es un transformer decoder-only de la familia Qwen2.5, sin componentes MoE.

La particularidad del proyecto es su diseño en tres capas: la identidad y el estilo conversacional se incorporan mediante un ajuste fino QLoRA; las reglas y normativa institucional se inyectan en tiempo de inferencia mediante RAG; y los cálculos concretos (tasas de matrícula, nota media) se delegan a herramientas externas invocadas por el modelo. Esta separación de responsabilidades permite modificar la normativa sin reentrenar y limita las respuestas al dominio cubierto por la guía.

Es relevante como ejemplo de especialización vertical barata: el ajuste se realizó sobre únicamente 432 ejemplos sintéticos generados con Gemini, con QLoRA de rango 16 y 3 épocas, sobre una GPU T4. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un modelo en fase inicial y con validación externa limitada. El único idioma declarado es el turco y el alcance queda restringido a los datos ficticios de dicha universidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5); ajuste fino mediante QLoRA |
| Parámetros totales | 3.085.938.688 (≈3,09 mil millones) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Qwen2.5-3B-Instruct (32.768 tokens) |
| Tipos de cuantización | Peso original en safetensors; se publica una versión GGUF, pero no se detallan las cuantizaciones concretas |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo Lale-3B-GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only preentrenado y alineado por instrucciones. Sobre esa base se aplicó un ajuste QLoRA con rango r=16, alpha=32, aplicado a todas las capas lineales durante 3 épocas. El autor justifica la elección del modelo base por su rendimiento en comprensión y generación en turco, la estabilidad de su plantilla de chat y su eficiencia de entrenamiento en una GPU T4.

El conjunto de entrenamiento propio (talha085/lale-3b-veri) consta de 432 ejemplos de conversación sintéticos generados con Gemini, repartidos entre ejemplos de identidad, flujos de RAG y flujos de agente con llamada a herramientas. No se documenta el uso de RLHF ni DPO, ni el volumen de tokens de entrenamiento. La innovación no está en la arquitectura, sino en la combinación de QLoRA para el estilo, RAG para las reglas y herramientas externas (yaz_okulu_ucreti para tasas de matrícula, gno_hesapla para el cálculo de nota media) para las operaciones deterministas. El modelo emite las llamadas a herramientas en formato JSON, capacidad que el autor reporta como validada en sus propias pruebas.

## Capacidades

- Generación de texto conversacional en turco, orientada a preguntas de administración académica.
- Adopción estable de una identidad y un estilo definidos (marca de identidad ★), con métrica de identidad reportada de 0,00 a 0,86 tras el ajuste.
- Soporte de tool calling / function calling mediante protocolo JSON, con invocación correcta de las herramientas personalizadas yaz_okulu_ucreti y gno_hesapla (métrica ajan_arac de 0,70 a 0,90).
- Formato JSON de agente validado al 100 % en la métrica ajan_json (partiendo ya del 1,00 en el modelo base).
- Flujos de agentes y razonamiento de varios pasos, principalmente consulta a la guía (RAG) más cálculo con herramienta.
- Integración con recuperación aumentada (RAG): el modelo recibe fragmentos recuperados y los usa para fundamentar la respuesta.
- Capacidad multilingüe limitada al turco declarado; no se documentan otras lenguas.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente de asuntos estudiantiles: gestión de consultas multi-turno sobre matrícula, selección de asignaturas, calendario de exámenes y servicios de campus, usando la guía institucional como fuente mediante RAG.
- Cálculo de tasas académicas: el modelo invoca la herramienta yaz_okulu_ucreti para obtener el importe exacto en lugar de estimarlo, lo que evita errores aritméticos en un dato sensible para el usuario.
- Cálculo de nota media (GNO): delegación en la herramienta gno_hesapla para obtener la media ponderada a partir de las asignaturas y créditos aportados por el usuario.
- Backend de chatbot con tool calling: el protocolo JSON del modelo permite conectarlo a un orquestador que ejecute funciones reales (consultas a base de datos académica, generación de PDFs de matrícula) sin parseo frágil de lenguaje natural.
- Demostración docente de fine-tuning eficiente: sirve como caso práctico de QLoRA sobre una GPU T4 con un dataset pequeño, útil en cursos o talleres sobre ajuste de modelos.
- Actualización de normativa sin reentrenar: al residir las reglas en el RAG, un cambio en la guía académica se implementa actualizando el índice documental, sin tocar los pesos.
- Punto de partida para portar el enfoque a otras universidades: el pipeline QLoRA + RAG + herramientas es reutilizable con un dataset de identidad propio y un corpus normativo distinto.

## Benchmarks y rendimiento

El autor publica únicamente métricas internas de comportamiento antes y después del ajuste, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). No se han publicado resultados de benchmarks en la información disponible.

| Métrica | Modelo base | Lale-3B ajustado |
|---|---|---|
| kimlik_ad (nombre de identidad) | 0,00 | 0,86 |
| kimlik_isaret (marca de identidad) | 0,00 | 1,00 |
| ajan_json (formato JSON del agente) | 1,00 | 1,00 |
| ajan_arac (uso correcto de herramientas) | 0,70 | 0,90 |

Se desconoce la metodología de evaluación (tamaño de muestra, procedimiento de puntuación) y no se aportan comparaciones con otros modelos en estas métricas.

## Requisitos de hardware

- Parámetros: 3,09 mil millones. El repositorio pesa 6,2 GB, coherente con pesos en precisión de 16 bits.
- VRAM estimada en FP16/BF16: en torno a 6-7 GB para los pesos, más activaciones y caché KV (el total práctico suele situarse en 8-10 GB).
- VRAM estimada cuantizado: aproximadamente 3-4 GB en 8 bits y 2-3 GB en 4 bits, según la cuantización GGUF empleada.
- Cabe en GPU de consumo: sí. Es viable en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) y en configuraciones de 6 GB con cuantización agresiva en 4 bits.
- El autor reporta que el entrenamiento QLoRA se completó en una NVIDIA T4.
- Opciones de despliegue: llama.cpp y Ollama mediante la versión GGUF publicada; vLLM, TGI o Transformers para servir los pesos safetensors; integración con pipelines RAG propios.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Lale-3B | 3,09 mil millones | 32.768 tokens (heredado del base) | Apache-2.0 | Asistente universitario en turco con RAG y herramientas |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens | Apache-2.0 | Modelo generalista de instrucciones, multilingüe |
| Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | Modelo generalista de instrucciones |

La comparación directa con alternativas especializadas en asuntos estudiantiles en turco no está disponible en la información consultada. Frente a los modelos generalistas, Lale-3B solo aporta ventaja en el nicho concreto para el que fue ajustado (identidad y flujos de agente de la universidad ficticia); en conocimiento general y cobertura idiomática parte en desventaja por su ajuste sobre 432 ejemplos y un único idioma declarado.

## Limitaciones y advertencias

- Alcance restringido: el modelo solo es válido para los datos ficticios de Lale Teknik Üniversitesi; no debe usarse como fuente de información académica real.
- Dependencia del RAG: si el recuperador devuelve fragmentos incorrectos, la respuesta se degrada, tal como advierte el propio autor.
- Dataset diminuto: 432 ejemplos sintéticos generados con Gemini; no se documenta evaluación de sesgos ni de robustez fuera del guion.
- Riesgo de alucinación: aunque el autor afirma que el modelo no inventa ante preguntas fuera de la guía, no hay evidencia publicada que lo respalde y el historial de alucinaciones no se ha auditado de forma independiente.
- Idiomas: solo turco declarado; no hay soporte verificado de castellano ni de otras lenguas.
- Licencia: Apache-2.0, permisiva para uso comercial, pero al derivar de Qwen2.5-3B-Instruct conviene revisar también las condiciones del modelo base y de los datos sintéticos utilizados.
- Madurez: 0 descargas y 0 likes, sin validación externa ni mantenimiento conocido; no es un candidato recomendable para producción crítica sin evaluación propia.
- Métricas internas sin metodología publicada: los valores de la tabla comparativa no permiten reproducir la evaluación.
- Pipeline de HuggingFace: no disponible, lo que limita la integración automática con algunas herramientas del ecosistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/talha085/Lale-3B
- Adaptador LoRA: https://huggingface.co/talha085/Lale-3B-LoRA
- Versión GGUF: https://huggingface.co/talha085/Lale-3B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/talha085/lale-3b-veri
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Sitio del proyecto (lale.ai, referencia encontrada en la búsqueda web): https://lale.ai/
