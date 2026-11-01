# trantam31/smollm2-360m-e2-pilot-lr1e-5

## Resumen

smollm2-360m-e2-pilot-lr1e-5 es un ajuste fino (fine-tuning) del modelo SmolLM2-360M de Hugging Face, publicado por el usuario trantam31 en Hugging Face. Se trata de un modelo de generación de texto compacto, de unos 362 millones de parámetros, basado en la arquitectura LLaMA del proyecto SmolLM2, diseñado para ejecutarse en hardware modesto.

El modelo se ha entrenado con la librería Transformers mediante el Trainer de Hugging Face, con una tasa de aprendizaje de 1e-05, 125 pasos de entrenamiento y un tamaño efectivo de lote de 32. La model card no documenta el dataset empleado ni los usos previstos, por lo que se trata de un modelo experimental cuyo propósito concreto no está especificado por el autor.

Su relevancia es limitada como modelo de producción: más que un modelo de uso general, es un experimento de fine-tuning (el sufijo "pilot" en el nombre sugiere una prueba piloto de entrenamiento). Resulta interesante como ejemplo de cómo adaptar un modelo pequeño de la familia SmolLM2 con recursos reducidos, y como base para continuar entrenamientos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder, familia SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M, un transformer decoder de la familia SmolLM2 de Hugging Face que utiliza la arquitectura LLaMA. El ajuste fino se ha realizado con el Trainer de Hugging Face usando AdamW (variante fused de PyTorch) con betas (0.9, 0.999) y epsilon 1e-08, planificador de tasa de aprendizaje coseno, 125 pasos de entrenamiento y precisión mixta nativa (AMP). El tamaño efectivo de lote fue de 32 (lote de 8 con 4 pasos de acumulación de gradiente), con semilla 0 y warmup del 3 % de los pasos.

No se ha documentado el dataset de entrenamiento (la model card lo indica como "unknown dataset"), ni el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. Las versiones de software empleadas fueron Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Generacion de texto en general, heredada del modelo base SmolLM2-360M.
- Capacidades del modelo base presumiblemente conservadas: razonamiento basico, generacion de codigo y tareas de chat (el modelo base SmolLM2 fue entrenado para instruccion y chat), aunque el ajuste fino pudo alterarlas y no hay documentacion al respecto.
- No hay informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modos de pensamiento extendido.
- No hay informacion sobre capacidades multilingues.

## Casos de uso

- Experimentacion con fine-tuning: sirve como punto de partida documentado para reproducir un ajuste fino ligero de SmolLM2-360M con hiperparametros concretos (lr 1e-05, 125 pasos, lote efectivo 32).
- Prototipado en hardware modesto: con 362 millones de parametros, permite probar pipelines de generacion de texto en GPUs de consumo o incluso CPU.
- Base para continued pretraining: al ser un checkpoint experimental con licencia Apache 2.0, puede retomarse para entrenamientos adicionales sin restricciones de licencia.
- Aprendizaje e investigacion: util para estudiar como hiperparametros pequenos (tasa de aprendizaje de 1e-05, pocas epocas) afectan a un modelo compacto.
- Integracion en aplicaciones de juguete o demos locales de generacion de texto donde la calidad de un modelo grande no es necesaria.
- Pruebas de despliegue con Transformers: al ser compatible con la libreria Transformers y safetensors, es adecuado para verificar pipelines de inferencia y endpoints antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card contiene una lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 362 millones de parametros en FP16, aproximadamente 0,8-1 GB de VRAM para los pesos, mas overhead de contexto; en FP32, en torno a 1,5 GB. Ejecutable en GPUs de consumo sin problema.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Suficiente con una RTX 3060, RTX 4060 o superior; tambien viable en CPU para inferencia de baja latencia.
- Cabe con holgura en GPUs de consumo, incluidas las de 4-6 GB de VRAM.
- Despliegue: compatible con la libreria Transformers (text-generation-inference, endpoints_compatible segun los tags). No hay pesos GGUF publicados en la informacion disponible, por lo que llama.cpp u Ollama requeririan una conversion manual.
- Latencia y throughput: no disponibles; dada la talla del modelo, se espera inferencia rapida incluso en hardware modesto.
- El tamano del repositorio es de 11,6 GB, lo que sugiere que incluye checkpoints adicionales ademas de los pesos finales.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Notas |
|---|---|---|---|---|
| smollm2-360m-e2-pilot-lr1e-5 | 361,8 M | no disponible | apache-2.0 | Fine-tuning experimental, dataset no documentado |
| HuggingFaceTB/SmolLM2-360M | ~360 M | 8192 (modelo base) | apache-2.0 | Modelo base, entrenado por Hugging Face con documentacion y benchmarks completos |
| HuggingFaceTB/SmolLM2-135M | ~135 M | 8192 (modelo base) | apache-2.0 | Version mas pequena de la familia, para dispositivos muy limitados |
| HuggingFaceTB/SmolLM2-1.7B | ~1.700 M | 8192 (modelo base) | apache-2.0 | Version mayor de la familia, con mejor rendimiento en benchmarks |

En general, para uso practico se recomienda el modelo base SmolLM2-360M u otro miembro documentado de la familia, dado que este fine-tuning carece de benchmarks y documentacion de entrenamiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; hereda potencialmente los sesgos del modelo base y del dataset no documentado empleado en el fine-tuning.
- Riesgo de alucinacion: tipico de modelos de lenguaje pequenos; sin evaluacion publicada, no se puede cuantificar.
- Limitaciones de contexto e idioma: no documentadas por el autor; se desconoce si el fine-tuning modifico la ventana de contexto o el comportamiento multilingue del modelo base.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- La model card esta generada automaticamente por el Trainer y contiene secciones vacias ("More information needed"): no hay descripcion del dataset, usos previstos ni resultados de entrenamiento, lo que dificulta evaluar su calidad.
- Con solo 125 pasos de entrenamiento, es probable que el ajuste fino sea marginal; el modelo puede comportarse de forma muy similar al base.
- No se recomienda para produccion sin evaluacion previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trantam31/smollm2-360m-e2-pilot-lr1e-5
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Familia SmolLM2 (repositorio de Hugging Face): https://huggingface.co/HuggingFaceTB
- No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.
