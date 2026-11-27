# yeopeter1031/aiot-fall-qwen3.5-2b-lora-r1

## Resumen

`yeopeter1031/aiot-fall-qwen3.5-2b-lora-r1` es un adaptador LoRA de investigación publicado por el usuario yeopeter1031 sobre el modelo base `Qwen/Qwen3.5-2B`. Su función no es detectar caídas a partir de audio o señales inerciales, sino actuar como política de texto que, a partir de un historial de dos turnos de observación (estado de sensores, pregunta del dispositivo y transcripción de voz), propone la siguiente acción en formato JSON. Está entrenado exclusivamente para coreano y se distribuye como adaptador PEFT, sin los pesos base ni el optimizador.

El modelo se enmarca en un pipeline de investigación sobre asistencia conversacional en dispositivos IoT de monitorización de caídas. La relevancia actual es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin validación clínica ni de campo. Su interés técnico reside en el enfoque de ajuste: LoRA de rango 16 sobre proyecciones de atención de texto y MLP, entrenado con supervisión únicamente sobre el JSON final y el token EOS, con datos sintéticos generados mediante TTS y transcripción automática.

El adaptador raíz corresponde al paso 592 de optimización, que es el checkpoint evaluado. Los subdirectorios `checkpoints/step-{100,200,300,400,500}` son instantáneas intermedias del mismo entrenamiento y no han sido evaluadas de forma independiente. El repositorio ocupa 0,4 GB y no incluye los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, base en bf16 en el ejemplo de uso) |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Modulos adaptados | proyecciones de atención de texto y MLP |
| Modelo base | Qwen/Qwen3.5-2B (revision 15852e8c16360a2fea060d615a32b45270f8a8fc) |
| Pasos de optimizacion | 592 (1 epoch) |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-2B`, un transformer decoder-only de 2.000 millones de parámetros. El ajuste LoRA se limita a las proyecciones de atención de texto y a las capas MLP, con rango 16, alpha 32 y dropout 0,05. El entrenamiento usa el modelo base en bf16, optimizador AdamW, tasa de aprendizaje 1e-4, batch efectivo de 16 y una sola época, lo que resulta en 592 pasos de optimización. La pérdida se calcula únicamente sobre el JSON final y el token EOS, de modo que la justificación del profesor (teacher rationale) no se supervisa.

La generación del conjunto de datos es completamente sintética: diálogos coreanos sintéticos, convertidos a audio con MMS-TTS en variantes limpia, ruidosa y recortada, transcritos con Whisper base y revisados de forma asistida por modelo, con un JSON final producido por GPT-OSS-20B y posterior cribado. No hay etiquetas humanas de referencia (gold labels). Se generaron 10.000 historiales de observación distintos, agrupados por primer turno, resultando en 9.464 ejemplos de entrenamiento y 536 de validación. El tokenizador original se carga desde la release fijada del modelo base.

## Capacidades

- Generación de la siguiente acción en JSON estructurado a partir de un historial de dos turnos con estado de sensores, pregunta del dispositivo y transcripción de voz.
- Clasificación de intención conversacional en cuatro categorías observadas en la evaluación: aclarar (clarify), cerrar (close), alertar (alert) y repetir (repeat), además de ofrecer (offer).
- Producción de argumentos de llamada y seguimiento dentro del JSON de salida.
- Modo de razonamiento desactivado (thinking off) en el protocolo de evaluación; no se documenta soporte de thinking mode.
- Capacidad multilingüe: únicamente coreano.
- No soporta tool calling genérico, agentes multi-paso, visión ni audio de forma nativa; su salida estructurada es específica del dominio de diálogo de caídas.

## Casos de uso

- Investigación sobre políticas de decisión en dispositivos IoT de monitorización de caídas: el adaptador permite estudiar cómo un modelo pequeño propone la siguiente acción conversacional a partir de un historial de sensores y transcripciones, sin necesidad de entrenar desde cero.
- Prototipado de asistentes de voz para el hogar en coreano: se puede integrar en un pipeline que transcriba audio con Whisper y consulte al modelo para decidir si conviene aclarar, cerrar la conversación o alertar, siempre como componente de investigación.
- Evaluación de técnicas de ajuste eficiente (LoRA) en modelos de 2B: el repositorio documenta hiperparámetros, número de pasos y protocolo de evaluación, lo que lo hace útil como referencia reproducible para experimentos de PEFT.
- Generación de datos sintéticos de diálogo estructurado: el pipeline descrito (TTS, ASR, revisión asistida y JSON final) puede reutilizarse para construir datasets de dominio específico con supervisión parcial.
- Análisis de acuerdos con profesor automático: los resultados de evaluación permiten estudiar la brecha entre un modelo ajustado y su profesor (GPT-OSS-20B) en tareas de decisión estructurada.
- Docencia y experimentación en PLN coreano: sirve como ejemplo de adaptación de un modelo base multilingüe a un dominio y un idioma concretos con recursos limitados.

## Benchmarks y rendimiento

Los datos de evaluación comparan el adaptador final con el Qwen3.5-2B instruction-tuned sin modificar, con el mismo prompt directo, thinking off, decodificación greedy y 160 tokens nuevos. Las métricas miden acuerdo con el profesor sobre transcripciones sintéticas, no precisión clínica ni de campo.

| Metrica | Adaptador final | Base sin modificar |
|---|---|---|
| Llamada + argumentos + seguimiento exactos | 512/536 | 0/536 |
| Objetivo parseado completo (incluye evidencia) | 422/536 | 0/536 |
| Baseline siempre-aclarar | 444/536 | no disponible |

Desglose por categoría del adaptador (SFT): aclarar 443/444, cerrar 39/40, alertar 30/32, repetir 0/19, ofrecer 0/1. Alertas del profesor no detectadas: 2/32; falsas alertas: 0/504. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador pesa 0,4 GB; el modelo base de 2B en bf16 requiere aproximadamente 4-5 GB, y en cuantización de 8 bits o 4 bits puede reducirse a unos 2-3 GB (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16, y en configuraciones de 4-6 GB con cuantización.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `Qwen3_5ForConditionalGeneration` y `peft.PeftModel`. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI con este adaptador; la integración con esos motores requeriría fusionar el adaptador con el base o cargarlo mediante PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aiot-fall-qwen3.5-2b-lora-r1 | 2B (base) + LoRA r16 | no disponible | Política JSON para diálogo de caídas en coreano | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Modelo general instruction-tuned | no disponible | Hugging Face |
| Adaptadores LoRA de dominio similares | variable | variable | Ajuste eficiente sobre modelos pequeños | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un detector de caídas: no procesa audio crudo ni señales IMU; solo trabaja sobre texto estructurado.
- No está validado para uso como dispositivo de alarma autónomo ni para decisiones clínicas o de campo.
- Los datos de entrenamiento y evaluación son sintéticos, sin etiquetas humanas de referencia; los resultados miden acuerdo con un profesor automático (GPT-OSS-20B), no precisión real.
- El rendimiento en escenarios no vistos o familias de escenarios distintas no está evaluado.
- La categoría "repetir" obtiene 0/19 y "ofrecer" 0/1 en la evaluación, lo que indica un fallo sistemático en esas clases.
- Solo soporta coreano; no hay evidencia de generalización a otros idiomas.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Riesgo de alucinación en la generación de JSON y de argumentos no válidos fuera del dominio de entrenamiento.
- El repositorio no incluye los pesos base ni el optimizador; es necesario descargar `Qwen/Qwen3.5-2B` en la revisión fijada.
- Los checkpoints intermedios (`step-100` a `step-500`) no han sido evaluados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/yeopeter1031/aiot-fall-qwen3.5-2b-lora-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
