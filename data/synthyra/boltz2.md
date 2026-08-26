# Synthyra/Boltz2

## Resumen

Synthyra/Boltz2 es un modelo de lenguaje proteico (protein language model) que empaqueta el checkpoint oficial `boltz-community/boltz-2` con el runtime FastPLMs para su uso a traves de la API estandar de Hugging Face Transformers. El modelo acepta secuencias de aminoacidos en formato crudo mediante una API de conveniencia y devuelve coordenadas 3D de estructuras proteicas junto con metricas de confianza (pLDDT, pTM, ipTM). Esta desarrollado por Synthyra y se publica bajo licencia MIT.

El modelo subyacente, Boltz-2, es una familia de modelos para la prediccion de interacciones biomoleculares desarrollada por el equipo de Boltz. Boltz-1 fue el primer modelo completamente open source que se acerco a la precision de AlphaFold3, y Boltz-2 va un paso mas alla al modelar conjuntamente estructuras complejas y afinidades de union, un componente critico para el diseno molecular. Con 520 millones de parametros, Boltz2 se posiciona como una alternativa ligera y abierta a modelos de prediccion de estructura proteica de mayor tamano.

La relevancia actual de este modelo radica en que democratiza el acceso a la prediccion de estructuras biomoleculares con una licencia permisiva (MIT), permitiendo su uso comercial y su integracion en pipelines de investigacion y desarrollo farmaceutico. El empaquetado con FastPLMs simplifica la carga del modelo mediante la interfaz estandar de Transformers, aunque requiere `trust_remote_code=True` y un entorno CUDA validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (FastPLMs, basada en Boltz-2) |
| Parametros totales | 520.636.223 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Boltz2 es un modelo de aprendizaje profundo para prediccion de estructuras biomoleculares, basado en la arquitectura de Boltz-2. A diferencia de los modelos de lenguaje puros, Boltz-2 es un modelo de co-plegamiento (co-folding) que predice estructuras 3D de complejos biomoleculares, incluyendo proteinas, acidos nucleicos y ligandos de pequenas moleculas. El modelo tambien estima afinidades de union, una capacidad que va mas alla de AlphaFold3 y Boltz-1.

El empaquetado FastPLMs transforma el checkpoint original de Boltz-2 a un formato compatible con la interfaz `PreTrainedModel` de Transformers. El proceso de conversion esta documentado en `source-record.json` dentro del repositorio, que registra las identidades exactas de las fuentes y los detalles de conversion. El modelo se ejecuta en FP32 con autocast BF16 en CUDA, y solo soporta el backend de atencion `eager`. Los detalles especificos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada, ya que el checkpoint original pertenece a Boltz-2 y su documentacion de entrenamiento no se incluye en esta ficha.

## Capacidades

- Prediccion de estructura 3D de proteinas a partir de secuencias de aminoacidos.
- Prediccion de estructuras de complejos biomoleculares (proteinas, acidos nucleicos, ligandos).
- Estimacion de afinidades de union entre biomoleculas.
- Generacion de metricas de confianza por complejo y por cadena: pLDDT, pTM, ipTM.
- Salida de coordenadas atomicas en formato CIF mediante el metodo `save_as_cif`.
- Extraccion de embeddings de secuencia (single y pairwise) para tareas downstream.
- Soporte de fine-tuning con PEFT (LoRA) sobre todas las capas lineales.
- Capacidad de ejecucion con reciclado (recycling steps) y muestreo de difusion configurable.

## Casos de uso

- Diseno de proteinas: el modelo puede predecir la estructura 3D de proteinas disenadas de novo, permitiendo validar in silico si una secuencia propuesta se pliega en la conformacion deseada antes de la expresion experimental.
- Descubrimiento de farmacos: prediccion de complejos proteina-ligando para evaluar la union de candidatos a farmacos, reduciendo el numero de experimentos de cristalografia o criomicroscopia electronica necesarios.
- Ingenieria de anticuerpos: modelado de complejos antigeno-anticuerpo para optimizar la afinidad y especificidad de anticuerpos terapéuticos mediante mutaciones dirigidas.
- Estudio de interacciones proteina-proteina: analisis de interfaces de union en complejos proteicos para identificar residuos criticos implicados en enfermedades o en la regulacion celular.
- Prediccion de efectos de mutaciones: evaluacion del impacto estructural de variantes geneticas, util en diagnostico clinico y en la interpretacion de datos genomicos.
- Integracion en pipelines de biologia computacional: el modelo sigue el contrato `PreTrainedModel` de Transformers, por lo que puede integrarse en pipelines existentes de PyTorch y Hugging Face con herramientas como PEFT para fine-tuning especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que Boltz2 es provisional en FastPLMs 1.0 y que la inferencia BF16 end-to-end en entorno nativo supera actualmente los limites fijos de equivalencia numerica. Por tanto, no se declara equivalencia oficial de inferencia para este checkpoint, y no hay datos comparativos de rendimiento frente a AlphaFold3, Boltz-1 u otros modelos.

## Requisitos de hardware

- El contrato de release requiere un dispositivo CUDA. El objetivo validado es una NVIDIA GH200 en Linux aarch64.
- No se proporcionan como evidencia de release las ejecuciones en Linux x86-64, CPU-only, Windows o macOS para ejecuciones de estructura.
- No se dispone de datos de VRAM estimada para inferencia ni de latencia/throughput.
- El modelo requiere Python 3.11-3.14, PyTorch 2.13 y Transformers 5.13.
- Opciones de despliegue: el modelo se carga mediante `AutoModel.from_pretrained` con `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Dado el tamano de 520M de parametros, es probable que quepa en GPUs de consumo como RTX 3090/4090 con 24 GB de VRAM, pero esto no esta confirmado en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Synthyra/Boltz2 | 520M | no disponible | MIT | Hugging Face |
| boltz-community/boltz-2 (original) | no disponible | no disponible | MIT | GitHub / Boltz |
| AlphaFold3 | no disponible | no disponible | No comercial (uso restringido) | Servicio web / codigo limitado |
| Boltz-1 | no disponible | no disponible | MIT | GitHub |

Boltz-2 es el primer modelo de aprendizaje profundo que modela conjuntamente estructuras complejas y afinidades de union, superando a AlphaFold3 y Boltz-1 en esa capacidad. La principal ventaja de Synthyra/Boltz2 frente al checkpoint original es su empaquetado como modelo Transformers estandar, lo que facilita su integracion en ecosistemas PyTorch/Hugging Face. Sin embargo, el estado provisional del empaquetado FastPLMs y la falta de equivalencia numerica declarada limitan su uso en entornos de produccion donde se requiera una precision numerica exacta.

## Limitaciones y advertencias

- Estado provisional: Boltz2 es provisional en FastPLMs 1.0 y no declara el nivel de cumplimiento (compliance tier). La inferencia BF16 end-to-end en entorno nativo supera actualmente los limites de equivalencia numerica, por lo que no se garantiza una equivalencia oficial de inferencia con el checkpoint original.
- Backend de atencion limitado: solo soporta el backend `eager`. Solicitar otro backend lanza una excepcion en lugar de cambiar silenciosamente la implementacion.
- Requisitos de hardware estrictos: el entorno validado es exclusivamente NVIDIA GH200 en Linux aarch64. Otras plataformas no tienen evidencia de release.
- Dependencias de versiones: requiere Python 3.11-3.14, PyTorch 2.13 y Transformers 5.13, lo que puede chocar con entornos existentes.
- Sin metricas de rendimiento publicadas: no hay datos de benchmarks ni de latencia/throughput en la informacion disponible.
- Sesgos y alucinaciones: al ser un modelo biologico, no se aplican los sesgos tipicos de modelos de lenguaje, pero la precision de las predicciones estructurales depende de la diversidad del dataset de entrenamiento original de Boltz-2, cuyos detalles no se incluyen en esta ficha.
- Licencia MIT: permite uso comercial y redistribucion, pero el repositorio local contiene licencias de fuentes aplicables, avisos y atribuciones que deben revisarse antes del uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synthyra/Boltz2
- Repositorio oficial de Boltz en GitHub: https://github.com/jwohlwend/boltz
- Sitio web de Boltz: https://boltz.bio/
- Repositorio alternativo de Boltz2 en GitHub: https://github.com/fuad021/boltz2
- Ficha de Boltz-2 en biolm.ai: https://biolm.ai/models/boltz2/
