# SZLHOLDINGS/chaski

## Resumen
Chaski es un fine-tune del modelo Qwen/Qwen3.5-0.8B desarrollado por SZLHOLDINGS como un experimento de investigación de "drafting" limitado por controlador. Con 873.438.784 parámetros y una arquitectura derivada de la familia Qwen3.5 (etiquetada en el repositorio como `qwen3_5` y con pipeline `image-text-to-text`), el modelo se presenta explícitamente como un artefacto de investigación en estado HOLD que ha fallado sus puertas de cualificación: 0/5 en borradores JSON y 2/6 en rechazos adversariales.

La relevancia del modelo no reside en su rendimiento, sino en su transparencia documental: el autor publica recibos de entrenamiento, informes de evaluación con hashes SHA-256 verificables y un "pasaporte de evidencia" que delimita qué se ha medido y qué no. El propio autor declara `publication_eligible: false` y `autonomy_eligible: false`, y advierte de que los borradores generados no son de confianza y requieren un controlador validador independiente.

Se distribuye bajo licencia Apache 2.0, con pesos en safetensors, y está pensado únicamente para inglés. No debe confundirse con un modelo listo para producción: es un artefacto que conserva su fallo de cualificación como evidencia de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (etiqueta `qwen3_5`; clase multimodal `Qwen3_5ForConditionalGeneration` / `AutoModelForImageTextToText`) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); incluye adaptador LoRA separado en `adapter-unsloth/` |

## Arquitectura y entrenamiento
El modelo es un fine-tune (relación declarada `finetune`, clase de artefacto `MERGED_FINETUNE`) sobre Qwen/Qwen3.5-0.8B. El repositorio incluye tanto un checkpoint fusionado como un adaptador LoRA independiente (192 tensores) alojado en `adapter-unsloth/`. La arquitectura subyacente es la de Qwen3.5, con un módulo de lenguaje (`model.language_model.layers.*`) y una clase de generación condicional multimodal, aunque la model card no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

Un aspecto técnico crítico documentado por el autor es la frontera de clase de cargador: los tensores del adaptador están indexados para el layout multimodal (`Qwen3_5ForConditionalGeneration`), de modo que al instanciar con `AutoModelForCausalLM` bajo transformers 5.18 se aplican 0 de los 192 tensores y el resultado es el modelo base sin adaptador, emitiendo solo una advertencia. Cualquier evaluación del adaptador debe registrar la cobertura 192/192 y la clase de cargador empleada. El autor no documenta uso de RLHF ni DPO; sí publica recibos de entrenamiento (`training_receipt.json`) con hashes verificables.

## Capacidades
- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B.
- Generación de borradores estructurados en JSON: capacidad declarada pero no superada (0/5 en la evaluación registrada).
- Rechazo adversarial: capacidad parcial (2/6 en la evaluación registrada).
- Procesamiento image-text-to-text según la etiqueta del repositorio y la clase multimodal del adaptador; no se detallan capacidades de visión en la model card.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: explícitamente desaconsejado; `autonomy_eligible: false`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Investigación sobre gobernanza de IA: el artefacto sirve como caso de estudio de un modelo que publica sus fallos de cualificación con evidencia verificable (hashes SHA-256, recibos de entrenamiento), útil para equipos que diseñan pipelines de evaluación reproducibles.
- Reproducción de evaluaciones: los informes `eval_report.json` y `eval_measured.json` permiten replicar las pruebas de borradores JSON y rechazo adversarial y comparar resultados con el checkpoint publicado.
- Estudio de fronteras de cargador en PEFT: el caso documentado de 0/192 tensores aplicados con `AutoModelForCausalLM` es un ejemplo práctico para validar la integración de adaptadores LoRA en transformers 5.x.
- Generación de borradores con controlador externo: en un pipeline donde un validador independiente filtre la salida, el modelo puede producir texto de partida en inglés, aunque sus propios resultados (0/5 en JSON) limitan su utilidad.
- Docencia y formación técnica: ilustra la diferencia entre pérdida de entrenamiento y rendimiento en held-out, y por qué un recibo copiado no cualifica una cuantización.
- Pruebas de infraestructura de inferencia: con 873 M de parámetros y 1,8 GB de repositorio, es adecuado para validar despliegues de transformers o endpoints en entornos de laboratorio antes de escalar a modelos mayores.

## Benchmarks y rendimiento
Los únicos resultados publicados son las evaluaciones internas del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K no están disponibles).

| Evaluación | Resultado | Puerta |
|---|---|---|
| Borradores JSON (`json_draft`) | 0/5 | fail |
| Rechazo adversarial (`adversarial_refusal`) | 2/6 | fail |
| Etiqueta global | MEASURED | fail |
| `publication_eligible` | false | — |
| `autonomy_eligible` | false | — |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 873 M de parámetros, en fp16 requeriría aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible; el autor declara `gpu: UNAVAILABLE` en los metadatos del artefacto.
- Cabe en GPU de consumo: previsiblemente sí por tamaño (el modelo base Qwen3.5-0.8B es de gama baja), aunque no hay confirmación oficial ni mediciones publicadas.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| SZLHOLDINGS/chaski | 873 M | no disponible | Apache 2.0 | Fine-tune de investigación, puertas fallidas, no elegible para publicación ni autonomía |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la información proporcionada | Modelo base oficial; referencia de capacidades sin el fine-tune |
| SZLHOLDINGS/chaski-r2 | no disponible | no disponible | no disponible | Adaptador hermano con el mismo layout de claves; usado como evidencia del fallo de carga |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Las puertas históricas de cualificación fallaron: 0/5 en borradores JSON y 2/6 en rechazos adversariales; el artefacto está en estado HOLD.
- `publication_eligible: false` y `autonomy_eligible: false`: no debe usarse en producción ni en flujos autónomos sin supervisión.
- Los borradores generados son no confiables y requieren un controlador validador independiente.
- Riesgo de que el adaptador no se aplique silenciosamente: con `AutoModelForCausalLM` en transformers 5.18 se aplican 0/192 tensores y se obtiene el modelo base; cualquier resultado sin cobertura 192/192 y clase de cargador registrada no es válido.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No hay datos publicados sobre sesgos, alucinación, longitud de contexto ni cuantizaciones validadas.
- La pérdida de entrenamiento no equivale a rendimiento en held-out; un recibo copiado no cualifica una cuantización ni un checkpoint fusionado.
- La licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja el despliegue por los fallos de evaluación documentados.
- No se ha verificado la identidad de firmantes independientes ni los bytes de los pesos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski
- Organización: https://huggingface.co/SZLHOLDINGS
- Command Lab (Space): https://huggingface.co/spaces/SZLHOLDINGS/szl-command-lab
- Fuente canónica en GitHub: https://github.com/szl-holdings/szl-forge/tree/main/chaski
- README revisado (evidencia): https://github.com/szl-holdings/szl-forge/blob/2b4d7a0f69e68d60cb0f35f09c9bac837d66acdc/chaski/card/README.md
- Baseline de autoría revisada: https://github.com/szl-holdings/szl-forge/blob/2f1f7636acf4e77d87de34319c34507f9441dc71/chaski/card/README.md
- Snapshot inmutable del repositorio: https://huggingface.co/SZLHOLDINGS/chaski/tree/d6306bb06fc4b5d4258ddd694fb493cf82332feb
- Recibo de entrenamiento: https://huggingface.co/SZLHOLDINGS/chaski/raw/d6306bb06fc4b5d4258ddd694fb493cf82332feb/training_receipt.json
- Recibo del adaptador: https://huggingface.co/SZLHOLDINGS/chaski/raw/d6306bb06fc4b5d4258ddd694fb493cf82332feb/adapter-unsloth/training_receipt.json
- Informe de evaluación: https://huggingface.co/SZLHOLDINGS/chaski/raw/d6306bb06fc4b5d4258ddd694fb493cf82332feb/eval_report.json
- Evaluación medida: https://huggingface.co/SZLHOLDINGS/chaski/raw/d6306bb06fc4b5d4258ddd694fb493cf82332feb/eval_measured.json
- Solicitud de soporte de proveedor: https://huggingface.co/spaces/huggingface/InferenceSupport/discussions/12783
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
