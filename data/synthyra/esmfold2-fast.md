# Synthyra/ESMFold2-Fast

## Resumen

ESMFold2-Fast es un modelo de lenguaje de proteínas desarrollado por Synthyra que empaqueta el checkpoint `biohub/ESMFold2-Fast` con el runtime FastPLMs para Hugging Face Transformers. A diferencia del modelo ESMFold2 completo, esta variante "Fast" está optimizada para inferencia de secuencia única, sin condicionamiento por alineamientos múltiples (MSA), lo que reduce la complejidad computacional y acelera el plegamiento de proteínas individuales. El modelo acepta secuencias de aminoácidos crudas o especificaciones tipadas de complejos moleculares (proteínas, ADN, ligandos) y devuelve estructuras 3D de alta resolución junto con métricas de confianza como pTM y pLDDT.

El checkpoint tiene 188,8 millones de parámetros y una arquitectura de 24 bloques, lo que lo sitúa en un rango de tamaño muy inferior al ESMFold2 completo (que emplea un backbone ESM++ de 6B). Esta reducción permite un despliegue más ligero y una inferencia más rápida, aunque sacrifica la capacidad de usar MSA como entrada. El modelo se distribuye bajo licencia MIT y se carga mediante `trust_remote_code=True` en Transformers, con soporte para backends de atención `eager`, `sdpa` y `flex_attention`.

La relevancia actual de ESMFold2-Fast radica en que ofrece una alternativa práctica para el plegamiento de proteínas de secuencia única en entornos con recursos limitados, manteniendo la compatibilidad con el ecosistema Transformers y permitiendo fine-tuning con PEFT (LoRA) para tareas de clasificación de secuencias y tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 24 bloques (variante Fast de ESMFold2) |
| Parametros totales | 188.819.011 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de aminoácidos, no texto; no se especifica longitud máxima) |
| Tipos de cuantizacion | no disponible (el backbone se carga en bf16 por defecto según la documentación de FastPLMs, pero no se listan cuantizaciones oficiales) |
| Idiomas soportados | no aplica (modelo de proteínas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ESMFold2-Fast es una variante reducida del modelo ESMFold2, que a su vez es el sucesor de ESMFold en la familia de modelos de lenguaje de proteínas de Biohub. La arquitectura base es un transformer de 24 bloques, muy inferior a los 48 o más bloques del modelo completo, lo que reduce el coste computacional. El modelo fue entrenado sin condicionamiento MSA, por lo que está optimizado para la predicción de estructura a partir de una única secuencia. Según la documentación, el trunk de plegamiento se ejecuta en fp32, mientras que el backbone ESM++ se carga en bf16 por defecto (aunque el checkpoint empaquetado aquí tiene 188M parámetros, no los 6B del modelo completo).

El entrenamiento siguió el enfoque de ESMFold2 descrito en el preprint de junio de 2026 sobre ESMC/ESMFold2, que introduce el concepto de "mundo modelo" y test-time compute. No se especifican detalles sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de plegamiento de proteínas y no de un LLM conversacional. Las cabezas de clasificación de secuencia y token están recién inicializadas y requieren fine-tuning antes de usarse para predicciones.

## Capacidades

- Plegamiento de proteínas de secuencia única: genera estructuras 3D en formato PDB o CIF a partir de una secuencia de aminoácidos, con métricas de confianza pTM y pLDDT.
- Predicción de estructuras de complejos moleculares: acepta entradas tipadas con múltiples cadenas de proteínas, ADN y ligandos (SMILES), siempre que cada cadena proteica use `msa=None`.
- Clasificación de secuencias y tokens: mediante cabezas recién inicializadas, puede adaptarse a tareas como predicción de propiedades de proteínas o anotación de residuos, tras fine-tuning.
- Compatibilidad con PEFT/LoRA: se puede ajustar con adaptadores LoRA usando `target_modules="all-linear"`.
- Backends de atención flexibles: soporta `eager`, `sdpa` y `flex_attention`, con fallback a eager para materializar tensores de atención.
- Sin soporte de tool calling ni agentes: es un modelo de propósito específico para biología estructural, no un LLM general.

## Casos de uso

- Predicción de estructura de proteínas individuales: un investigador puede pasar una secuencia de aminoácidos y obtener un modelo 3D en PDB para visualización en herramientas como PyMOL o ChimeraX, con confianza pLDDT para evaluar la calidad de las regiones.
- Diseño de proteínas de novo: al explorar variantes de secuencia, el modelo permite filtrar candidatos por estabilidad estructural predicha (pTM alto) antes de la validación experimental.
- Análisis de interacciones proteína-ligando: usando entradas tipadas con `LigandInput` (SMILES), se pueden predecir complejos proteína-ligando para estudios de acoplamiento preliminares.
- Screening de mutaciones: comparar estructuras predichas de variantes de una proteína para evaluar el impacto de mutaciones puntuales en la estructura global.
- Generación de datasets de entrenamiento: las estructuras predichas pueden servir como pseudo-etiquetas para entrenar modelos de clasificación de secuencias, aprovechando las cabezas de clasificación incorporadas.
- Integración en pipelines de biología computacional: al ser compatible con Transformers, puede integrarse en flujos existentes con `AutoModel` y ejecutarse en GPU para procesamiento por lotes de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como TM-score, RMSD o comparativas con otros predictores de estructura en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- El modelo requiere una GPU con CUDA; el entorno validado es NVIDIA GH200 en Linux aarch64. No se garantiza el funcionamiento en CPU, Windows o macOS para tareas de estructura.
- Con 188,8 millones de parámetros, el checkpoint en fp32 ocupa aproximadamente 0,75 GB, y en bf16 unos 0,38 GB. Sin embargo, el trunk de plegamiento se ejecuta en fp32 y puede requerir memoria adicional para la difusión y el muestreo.
- Es probable que quepa en GPUs de consumo como RTX 3090 o RTX 4090 (24 GB VRAM), pero no hay evidencia oficial de soporte en estas plataformas.
- Opciones de despliegue: el modelo se carga mediante `transformers.AutoModel` con `trust_remote_code=True`. No se mencionan integraciones con vLLM, Ollama o TGI.
- La latencia y el throughput no están documentados. Dado el tamaño reducido, se espera una inferencia más rápida que el ESMFold2 completo, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Synthyra/ESMFold2-Fast | 188,8M | no disponible | MIT | Hugging Face |
| Synthyra/ESMFold2 | no disponible (probablemente 6B) | no disponible | no disponible | Hugging Face |
| ESMFold (original) | ~650M | no disponible | MIT | GitHub/Hugging Face |

No se dispone de datos de rendimiento comparativo. El modelo Fast es una variante ligera de ESMFold2, con 24 bloques frente a los 48 o más del modelo completo, y sin soporte MSA. Esto lo hace más adecuado para entornos con recursos limitados o aplicaciones en tiempo real, a costa de una precisión potencialmente menor en casos que requieran alineamientos múltiples.

## Limitaciones y advertencias

- El modelo rechaza entradas con MSA (`ProteinInput.msa`); solo admite secuencias individuales. Para tareas que requieran MSA, debe usarse el ESMFold2 completo.
- Las cabezas de clasificación de secuencia y token están recién inicializadas y no producen predicciones válidas sin fine-tuning previo.
- El release contract solo valida NVIDIA GH200 en Linux aarch64. No hay evidencia de soporte en CPU, Windows, macOS o GPUs x86-64.
- No se especifica la longitud máxima de secuencia soportada; secuencias muy largas pueden agotar la memoria.
- Al ser un modelo de proteínas, no aplica a tareas de lenguaje natural; no hay sesgos lingüísticos, pero sí posibles sesgos en el dataset de proteínas utilizado para el entrenamiento (no detallado).
- La licencia MIT permite uso comercial, pero el runtime FastPLMs se distribuye con código embebido que requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio remoto.
- No hay información sobre la calidad de las predicciones en términos de TM-score o RMSD; se recomienda validar experimentalmente los resultados.

## Enlaces

- [Hugging Face - Synthyra/ESMFold2-Fast](https://huggingface.co/Synthyra/ESMFold2-Fast)
- [Hugging Face - Synthyra/ESMFold2 (modelo completo)](https://huggingface.co/Synthyra/ESMFold2)
- [GitHub - Synthyra/FastPLMs (README de ESMFold2)](https://github.com/Synthyra/FastPLMs/blob/main/fastplms/esmfold2/README.md)
- [Biohub - ESMFold2 Protein Structure Prediction](https://www.biohub.ai/models/esmfold2)
- [Synthyra Models - ESMFold2 Test-Time Compute](https://synthyra.com/models/esmfold-ttt)
