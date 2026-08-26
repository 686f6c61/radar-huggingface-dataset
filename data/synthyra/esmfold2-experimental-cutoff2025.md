# Synthyra/ESMFold2-Experimental-Cutoff2025

## Resumen

Synthyra/ESMFold2-Experimental-Cutoff2025 es un checkpoint del modelo de predicción de estructura de proteínas ESMFold2, empaquetado por Synthyra con el runtime FastPLMs para su uso a través de Hugging Face Transformers. ESMFold2 es el sucesor de ESMFold y establece un nuevo estado del arte en predicción de estructura de secuencia única, permitiendo además la generación de proteínas funcionales mediante la búsqueda en el espacio latente del modelo ESMC. Este checkpoint concreto es una versión experimental con fecha de corte en 2025, que ofrece inferencia de estructura 3D de biomoléculas directamente desde la secuencia de aminoácidos, con soporte opcional de alineamientos múltiples de secuencias (MSA).

El modelo cuenta con 225,75 millones de parámetros distribuidos en 48 bloques transformer, y acepta entradas que van desde secuencias individuales hasta complejos moleculares tipados (proteínas, ADN, ligandos). Su relevancia actual radica en que combina una arquitectura de vanguardia en biología estructural con una integración sencilla en el ecosistema Transformers, lo que facilita su adopción en pipelines de investigación y desarrollo bioinformático. La licencia MIT permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 48 bloques (ESMFold2) |
| Parametros totales | 225.753.308 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de secuencias de proteínas, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de proteínas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ESMFold2 es un modelo transformer de 48 bloques que procesa secuencias de aminoácidos para predecir estructuras tridimensionales de proteínas y complejos biomoleculares. A diferencia de su predecesor ESMFold, incorpora un mecanismo de difusión para la generación de coordenadas atómicas y soporta entrada condicionada por MSA (alineamientos múltiples de secuencias) cuando se proporcionan. El checkpoint se distribuye con el runtime FastPLMs, que implementa la arquitectura y se carga mediante `trust_remote_code=True` en Transformers.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de biología estructural y no de lenguaje. El checkpoint es completo (full 48-block) y las cabezas de clasificación de secuencias y tokens están recién inicializadas, por lo que requieren fine-tuning antes de interpretar sus salidas como predicciones.

## Capacidades

- Predicción de estructura 3D de proteínas a partir de secuencia única, con salida en formato PDB y CIF.
- Inferencia condicionada por MSA opcional para mejorar la precisión en casos con homólogos conocidos.
- Plegamiento de complejos moleculares multícadena, incluyendo proteínas, ADN y ligandos definidos por SMILES.
- Extracción de características (feature extraction) de secuencias de proteínas para tareas downstream.
- Clasificación de secuencias y clasificación de tokens (residuos) mediante cabezas entrenables sobre el backbone preentrenado.
- Soporte de backends de atención: `eager`, `sdpa` y `flex_attention`.
- Integración con PEFT para fine-tuning con LoRA.
- Métodos auxiliares para convertir resultados a PDB/CIF y obtener métricas de confianza (pTM, pLDDT).

## Casos de uso

- Predicción de estructura de proteínas para investigación biomédica: el modelo genera estructuras 3D de alta resolución a partir de secuencias, lo que permite estudiar la función de proteínas sin necesidad de cristalografía experimental. Se usa con el método `fold_protein` y produce archivos PDB listos para visualización.
- Diseño racional de proteínas: los investigadores pueden mutar secuencias y predecir el impacto estructural, acelerando el diseño de enzimas o anticuerpos con propiedades mejoradas. La capacidad de procesar complejos multícadena facilita el estudio de interacciones proteína-proteína.
- Análisis de variantes patogénicas: al comparar estructuras predichas de variantes wild-type y mutadas, se pueden identificar alteraciones estructurales asociadas a enfermedades. El modelo permite ejecutar múltiples predicciones en lote.
- Docking y screening virtual de ligandos: la entrada de complejos con ligandos (SMILES) permite predecir la estructura de unión proteína-ligando, útil en el descubrimiento de fármacos. El modelo genera coordenadas para todos los átomos del complejo.
- Generación de datos de entrenamiento para otros modelos: las características extraídas (embeddings) pueden usarse para entrenar clasificadores de función proteica o predecir interacciones, gracias a la integración con `AutoModelForSequenceClassification` y `AutoModelForTokenClassification`.
- Fine-tuning especializado con LoRA: el checkpoint admite PEFT, por lo que puede adaptarse a tareas específicas como predicción de afinidad de unión o localización subcelular con pocos datos etiquetados, manteniendo el backbone preentrenado congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas comparativas como MMLU, HumanEval o GSM8K (no aplicables a un modelo de proteínas), ni datos de precisión estructural tipo TM-score o RMSD frente a otros predictores. La búsqueda web menciona que ESMFold2 establece un nuevo estado del arte en predicción de secuencia única, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- El modelo requiere una GPU con soporte CUDA; no se admite ejecución solo en CPU, Windows o macOS para tareas de estructura.
- Plataforma validada: NVIDIA GH200 en Linux aarch64. No hay evidencia de soporte en otras arquitecturas.
- Con 225 millones de parámetros, el checkpoint en fp32 ocuparía aproximadamente 900 MB, por lo que cabría en GPUs consumer con 8 GB de VRAM o más, pero no se ha verificado oficialmente.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Se requiere Python 3.11-3.14, PyTorch 2.13 y Transformers 5.13.
- Para entornos aislados, se puede construir un artefacto local con manifest y usar `local_files_only=True`.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas como ESMFold original o AlphaFold. Se sabe que ESMFold2 es el sucesor de ESMFold y mejora el estado del arte en predicción de secuencia única, pero no hay cifras publicadas en la información disponible. Tampoco se han encontrado modelos comparables con el mismo empaquetado FastPLMs. Por tanto, la comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- El modelo solo está validado en NVIDIA GH200 con Linux aarch64; su funcionamiento en otras GPUs o plataformas no está garantizado.
- Las cabezas de clasificación de secuencias y tokens están inicializadas aleatoriamente y deben ser fine-tuned antes de usarse para predicciones reales.
- No se proporcionan datos de cuantización; el uso en entornos con memoria limitada podría requerir conversiones no soportadas oficialmente.
- La predicción de estructuras puede presentar errores en regiones flexibles o desordenadas; las métricas pLDDT y pTM ayudan a evaluar la confianza, pero no se han publicado umbrales de validación.
- Al ser un modelo experimental (fecha de corte 2025), puede contener artefactos o comportamientos no completamente pulidos.
- La licencia MIT permite uso comercial, pero el usuario es responsable de cumplir con las normativas aplicables en biología estructural y bioinformática.

## Enlaces

- [HuggingFace - Synthyra/ESMFold2-Experimental-Cutoff2025](https://huggingface.co/Synthyra/ESMFold2-Experimental-Cutoff2025)
- [HuggingFace - Variante Fast](https://huggingface.co/Synthyra/ESMFold2-Experimental-Fast-Cutoff2025)
- [GitHub - FastPLMs (model cards)](https://github.com/Synthyra/FastPLMs/blob/main/model_cards/esmfold2_experimental_cutoff2025.md)
- [Biohub - ESMFold2 Protein Structure Prediction](https://www.biohub.ai/models/esmfold2)
- [Insights DB - Análisis de vulnerabilidades](https://insights-db.paloaltonetworks.com/models/biohub/ESMFold2-Experimental-Cutoff2025/18ec939b3aaa77ee79c3d712e6a60b7333f414e3/versions)
