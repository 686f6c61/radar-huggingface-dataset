# ummeabiha/squad-eqa-runs

## Resumen

`ummeabiha/squad-eqa-runs` no es un modelo único, sino un repositorio que agrupa cuatro modelos entrenados para *extractive question answering* (QA extractivo) sobre el conjunto de datos SQuAD 1.1, junto con las tablas de resultados, figuras y el cuaderno que los generó. Lo publica el usuario ummeabiha como entrega de la asignatura DS5007 Programming Assignment 2. El repositorio tiene un tamaño de 11,5 GB y contiene pesos en formato safetensors para los modelos basados en Transformers, además de checkpoints `.pt` para los modelos entrenados desde cero.

Los cuatro modelos cubren un espectro que va desde un transformer pequeño entrenado desde cero (22,5 M de parámetros) hasta arquitecturas preentrenadas tipo ELECTRA-base (108,9 M) y RoBERTa-base (124,1 M) adaptadas a la tarea. La relevancia es fundamentalmente didáctica y de reproducibilidad: permite comparar el efecto del preentrenamiento con MLM en dominio frente al entrenamiento desde cero, y muestra cómo el truncamiento simple frente a la ventana deslizante (*sliding window*) afecta al rendimiento en contextos largos.

No se trata de un modelo de propósito general ni de un *chat model*: es una colección de extractores de respuesta para contextos y preguntas, sin generación libre, sin tool calling y sin capacidades multilingües declaradas. No hay información sobre licencia ni sobre idiomas soportados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para QA extractivo (modelos scratch propios y fine-tuning de ELECTRA-base y RoBERTa-base) |
| Parametros totales | 22,5 M (scratch), 22,5 M (scratch + MLM en dominio), 108,9 M (ELECTRA-base), 124,1 M (RoBERTa-base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; los modelos ELECTRA y RoBERTa usan truncamiento y ventana deslizante respectivamente, con `maximum length` y `stride` configurables en `qa_run_config.json` |
| Tipos de cuantizacion | no disponible (pesos safetensors y checkpoints `.pt` en precisión de entrenamiento) |
| Idiomas soportados | no disponible (SQuAD 1.1 es un dataset en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (ELECTRA y RoBERTa), `.pt` (modelos scratch) |

## Arquitectura y entrenamiento

El repositorio contiene cuatro configuraciones. Dos son transformers entrenados desde cero (22,5 M de parámetros): uno sin preentrenamiento adicional y otro con *masked language modeling* (MLM) en dominio antes del ajuste fino para QA. Los otros dos parten de modelos preentrenados: ELECTRA-base (108,9 M) con truncamiento del contexto y RoBERTa-base (124,1 M) con ventana deslizante (*sliding window*) para cubrir contextos largos. Cada carpeta bajo `models/` incluye pesos, tokenizer y un `qa_run_config.json` con la longitud máxima y el *stride* utilizados, además de la arquitectura de los modelos scratch.

El entrenamiento se realizó sobre SQuAD 1.1 y la evaluación se hizo sobre el *dev set* oficial (10.570 preguntas) con la métrica oficial (Exact Match y F1). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; al ser una tarea extractiva supervisada, el ajuste es por *span prediction* con las anotaciones de SQuAD. La innovación técnica destacable es metodológica: la comparación controlada entre entrenamiento desde cero, preentrenamiento MLM en dominio y *fine-tuning* de encoders preentrenados, junto con la comparación entre truncamiento y ventana deslizante.

## Capacidades

- Question answering extractivo: dado un contexto y una pregunta, devuelve el *span* de texto que responde.
- Manejo de contextos largos mediante ventana deslizante en el modelo RoBERTa-base (configurable vía `stride`).
- Carga directa con `transformers` (`AutoModelForQuestionAnswering`, `pipeline('question-answering')`) para ELECTRA y RoBERTa.
- Inferencia sin cuaderno mediante `inference.py`, que también carga los modelos scratch (`ScratchQAModel`).
- No soporta generación de texto libre, tool calling, agentes, visión, audio ni *thinking mode*.
- Capacidades multilingües: no disponibles (entrenado y evaluado en inglés sobre SQuAD 1.1).

## Casos de uso

- Evaluación comparativa de arquitecturas en docencia: el repositorio permite reproducir la comparación entre un transformer desde cero y encoders preentrenados, útil como material de prácticas de NLP.
- Extracción de respuestas en documentos estructurados: usar RoBERTa-base con ventana deslizante para localizar datos concretos (fechas, nombres, cifras) en contratos o informes de varias páginas.
- Construcción de un *baseline* de QA extractivo: los modelos ELECTRA y RoBERTa sirven como referencia rápida antes de adoptar modelos generativos más grandes.
- Prototipado de asistentes de documentación técnica: dado un fragmento de manual y una pregunta, devolver la frase exacta que la responde sin riesgo de paráfrasis inventada.
- Análisis de *pipelines* de preprocesado: comparar truncamiento frente a ventana deslizante para decidir la estrategia de segmentación en un corpus propio.
- Investigación sobre preentrenamiento en dominio: el par scratch vs scratch+MLM permite medir cuánto aporta el MLM en dominio con solo 22,5 M de parámetros.
- Verificación de métricas y reproducibilidad: los CSV en `results/` y las predicciones de test permiten auditar Exact Match y F1 sin reentrenar.

## Benchmarks y rendimiento

Resultados sobre el *dev set* oficial de SQuAD 1.1 (10.570 preguntas), métrica oficial:

| Modelo | Carpeta | Parámetros | Test EM | Test F1 |
|---|---|---|---|---|
| Scratch Transformer | `scratch_f9ed439f` | 22,5 M | 34,91 | 47,98 |
| Scratch + MLM en dominio | `scratch_mlm_d5ed7f75` | 22,5 M | 55,98 | 67,37 |
| ELECTRA-base (truncamiento) | `electra_56b9af30` | 108,9 M | 85,35 | 91,90 |
| RoBERTa-base (ventana deslizante) | `roberta_26dc0834` | 124,1 M | 85,87 | 91,99 |

## Requisitos de hardware

- VRAM para inferencia: los modelos scratch (22,5 M de parámetros) caben holgadamente en menos de 1 GB en FP32; ELECTRA-base y RoBERTa-base (≈109 M y ≈124 M) requieren del orden de 0,5-1 GB en FP32, sin contar el *batch* y los tensores intermedios.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en CPU para volúmenes pequeños.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluida una GTX 1650 o superior.
- Opciones de despliegue: `transformers` con `pipeline('question-answering')` para ELECTRA y RoBERTa; `inference.py` para los cuatro modelos; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EM / F1 (SQuAD 1.1 dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ummeabiha/squad-eqa-runs` (RoBERTa-base) | 124,1 M | ventana deslizante (configurable) | 85,87 / 91,99 | no disponible | Hugging Face |
| `ummeabiha/squad-eqa-runs` (ELECTRA-base) | 108,9 M | truncamiento (configurable) | 85,35 / 91,90 | no disponible | Hugging Face |
| `ummeabiha/squad-eqa-runs` (scratch + MLM) | 22,5 M | no disponible | 55,98 / 67,37 | no disponible | Hugging Face |
| Modelos QA extractivos estándar sobre SQuAD 1.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de cifras de modelos de referencia externos para una comparación cuantitativa fiable; los valores de la tabla se limitan a los publicados por el autor.

## Limitaciones y advertencias

- QA exclusivamente extractivo: no genera respuestas, solo devuelve un *span* del contexto; si la respuesta no está literalmente en el texto, fallará.
- Entrenado y evaluado en inglés sobre SQuAD 1.1; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Los modelos scratch (22,5 M) tienen un rendimiento notablemente inferior (EM 34,91 y 55,98), por lo que no son adecuados para producción.
- El modelo ELECTRA usa truncamiento, lo que puede perder la respuesta si esta cae fuera de la ventana; RoBERTa con ventana deslizante mitiga el problema pero añade coste computacional.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Repositorio de tipo académico (asignatura DS5007), sin mantenimiento ni soporte documentado; 0 descargas y 0 *likes* en el momento de la consulta.
- Riesgo de alucinación bajo en la tarea extractiva (el *span* proviene del contexto), pero riesgo de respuestas incorrectas por desalineación de *offsets* o segmentación defectuosa.
- No se documentan sesgos específicos; al derivar de SQuAD 1.1, hereda los sesgos de composición de dicho dataset (predominio de textos enciclopédicos en inglés).
- Tamaño del repositorio de 11,5 GB: la descarga completa incluye pesos de los cuatro modelos, resultados y figuras, no solo un modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ummeabiha/squad-eqa-runs
- Dataset SQuAD 1.1 (referencia de la tarea): https://rajpurkar.github.io/SQuAD-explorer/
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
