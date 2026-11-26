# yrpark/openvtla-gear_assembly-dagger_event-r2

## Resumen

openvtla-gear_assembly-dagger_event (r2) es un ajuste fino mediante DAgger del modelo base OpenVTLA `yrpark/openvtla-gear_assembly`, desarrollado por el usuario de Hugging Face yrpark. Se trata de un modelo de politica visomotora-tactil para control robotico en tareas de ensamblaje de engranajes, construido sobre la arquitectura pi0.5 combinada con el encoder tactil AnyTouch2 y el framework OpenViTac. El modelo parte del checkpoint base en el paso 19999 y anade un cabezal de eventos tactiles que se emplea unicamente durante el entrenamiento.

La relevancia de este modelo reside en su enfoque multimodal: combina vision, tacto (sensores GelSight Mini) y datos de recuperacion generados mediante DAgger para mejorar la robustez ante situaciones de bloqueo durante el ensamblaje. El entrenamiento se realizo con LoRA sobre los modulos gemma_2b_lora y gemma_300m_lora, con un horizonte de 50 pasos y 18 tokens tactiles. El repositorio ocupa 6,4 GB e incluye el checkpoint final en formato openpi.

No se han publicado resultados de evaluacion en simulador (marcados como pendientes) ni datos de benchmarks, por lo que la ficha refleja exclusivamente la informacion disponible en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 + AnyTouch2 (encoder tactil), ajuste fino con LoRA (gemma_2b_lora + gemma_300m_lora) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | openpi checkpoint (`params/` para inferencia, `assets/` con estadisticas de normalizacion) |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5, una politica visomotora, combinada con el encoder tactil AnyTouch2 dentro del framework OpenViTac. El ajuste fino se realiza con LoRA sobre los modulos gemma_2b_lora y gemma_300m_lora, lo que permite adaptar el modelo base sin reentrenar todos los parametros. La tarea concreta es el ensamblaje de engranajes en simulacion con sensores GelSight Mini, con un horizonte de prediccion de 50 pasos y 18 tokens tactiles (cls_pool2).

El entrenamiento parte del checkpoint base `yrpark/openvtla-gear_assembly` en el paso 19999, conservando sus estadisticas de normalizacion. Los datos combinan demos scripted del dataset `openvitac/gear_assembly_gelsight` y datos DAgger de `openvitac/gear_assembly_dagger_gelsight`, muestreados 50:50. Los datos DAgger de r1+r2 suman 44 episodios y 15.118 frames (39 segmentos de recuperacion y 5 exitos base), con etiquetas `event_blocked` distribuidas como 406 para 1, 4.705 para -1 y 10.007 para 0. La funcion de perdida combina flow matching (BC) con un cabezal de eventos tactiles basado en BCE sobre tokens tactiles proyectados y agrupados (L2-normalizado, lineal, temperatura 0,1, inicializacion a cero), con peso 0,1 y peso positivo 5,0. Se entrenaron 5.000 pasos con batch 64, LR 2,5e-5 con decaimiento coseno hasta 2,5e-6 (warmup 200), en una NVIDIA B200 durante aproximadamente 3 horas. La perdida final de entrenamiento se situo entre 0,0028 y 0,0047 en los ultimos pasos registrados.

## Capacidades

- Control robotico visomotil para tareas de ensamblaje de engranajes en simulacion.
- Fusion de vision y tacto mediante el encoder AnyTouch2 y sensores GelSight Mini.
- Prediccion de acciones con horizonte de 50 pasos.
- Deteccion de eventos de bloqueo durante el entrenamiento mediante un cabezal tactil dedicado (no usado en inferencia).
- Recuperacion ante situaciones de fallo gracias al entrenamiento con datos DAgger.
- Inferencia equivalente al modelo base, ya que el cabezal de eventos es solo para entrenamiento.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni multilingues.

## Casos de uso

- Ensamblaje de engranajes en simulacion: el modelo ejecuta politicas visomotiles entrenadas especificamente para esta tarea, usando vision y tacto para alinear y encajar piezas con tolerancias ajustadas.
- Investigacion en aprendizaje por refuerzo e imitacion: sirve como punto de partida para experimentos con DAgger y datos de recuperacion en tareas de manipulacion.
- Desarrollo de politicas tactiles: util para evaluar el impacto de sensores GelSight Mini y del encoder AnyTouch2 en tareas de contacto.
- Benchmarking de frameworks de robotica: permite comparar el rendimiento de pi0.5 + OpenViTac frente a otras arquitecturas en entornos simulados.
- Generacion de datos de recuperacion: el modelo y su pipeline DAgger pueden emplearse para producir trayectorias de recuperacion etiquetadas con eventos de bloqueo.
- Prototipado de sistemas de control con LoRA: el uso de LoRA sobre gemma_2b y gemma_300m facilita experimentos de ajuste fino con recursos moderados.
- Docencia y reproduccion de experimentos: el repositorio incluye el checkpoint, las estadisticas de normalizacion y el log de entrenamiento, lo que facilita la reproduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion en simulador esta marcada como pendiente en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 6,4 GB, pero no se especifica el consumo en VRAM).
- GPU recomendadas: el entrenamiento se realizo en 1x NVIDIA B200; no se documentan requisitos minimos para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de politicas de openpi mediante `uv run scripts/serve_policy.py policy:checkpoint`, con el checkpoint colocado en `checkpoints/openvtla_gear_assembly_dagger_event/r2/4999`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openvtla-gear_assembly-dagger_event (r2) | no disponible | no disponible | Ensamblaje de engranajes (vision + tacto) | other | Hugging Face (repo de 6,4 GB) |
| yrpark/openvtla-gear_assembly (base) | no disponible | no disponible | Ensamblaje de engranajes (vision + tacto) | other | Hugging Face |
| Otros modelos pi0.5 / OpenViTac | no disponible | no disponible | Politicas visomotiles | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion en simulador; el rendimiento real es desconocido.
- El modelo esta especializado en una unica tarea (ensamblaje de engranajes) y un unico entorno de simulacion; no es generalista.
- El cabezal de eventos tactiles solo se usa durante el entrenamiento; en inferencia el modelo se comporta como el base.
- La licencia es "other", sin terminos explicitos en la informacion disponible; es necesario revisar las condiciones antes de un uso comercial.
- No se documentan idiomas soportados ni capacidades de texto, por lo que no es adecuado para tareas de lenguaje natural.
- Riesgo de sobreajuste a los datos DAgger (44 episodios, 15.118 frames) y a la distribucion de la simulacion.
- No se especifican sesgos conocidos, pero al ser un modelo de robotica entrenado en simulacion, puede presentar problemas de transferencia al mundo real.
- El checkpoint no incluye `train_state/`, lo que limita la reanudacion del entrenamiento desde este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-gear_assembly-dagger_event-r2
- Modelo base: https://huggingface.co/yrpark/openvtla-gear_assembly
- Dataset de datos: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Codigo tactile_base: https://github.com/YuriPark0123/tactile_base
