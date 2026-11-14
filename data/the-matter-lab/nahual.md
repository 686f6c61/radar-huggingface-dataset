# the-matter-lab/nahual

## Resumen

Nahual es un modelo de secuencia de 1,58 mil millones de parámetros desarrollado por The Matter Lab para procesar de forma conjunta texto y estructuras tridimensionales de moléculas, cristales y superficies. Se inicializa a partir de Qwen3-0.6B y amplía el paradigma de modelado de lenguaje al dominio químico: cada token combina un fragmento de texto (word piece) o un número atómico con una posición 3D, de modo que el modelo puede recibir un prompt mixto y responder tanto con texto como con nuevas estructuras atómicas. Un único conjunto de pesos cubre doce tareas de química 3D, entre ellas estados de transición, microsolvatación, búsqueda de conformeros, predicción de estructura cristalina, adsorción y trayectorias de banda elástica (NEB).

El modelo es relevante porque unifica en una sola arquitectura generativa tareas que tradicionalmente requerían modelos especialistas independientes, y lo hace con resultados que, según la model card, superan al estado del arte en predicción de estructura cristalina (MP-20) y en generación condicionada por propiedades de moléculas (QM9). Forma parte de la publicación de NeurIPS 2026 *Nahual: A Sequence Model for Language and Atoms* y se distribuye con checkpoints, datos de entrenamiento, muestras de evaluación y código de inferencia.

La arquitectura combina un transformer causal inicializado desde Qwen3-0.6B que predice el siguiente token discreto con un segundo transformer causal que genera la posición de cada átomo mediante difusión, condicionado a la secuencia limpia generada hasta ese punto (next-token diffusion). El repositorio incluye dos variantes: Nahual (1,58B parámetros) y DiffMLP (1,31B), una ablación que sustituye el segundo transformer por un MLP de difusión por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tokens discretos (inicializado desde Qwen3-0.6B) con un segundo transformer causal de difusión para posiciones atómicas (next-token diffusion) |
| Parametros totales | 1,58B (Nahual); 1,31B (DiffMLP, ablación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo está orientado a texto científico y estructuras 3D) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (`.pt`); 25 GB por checkpoint de Nahual, 21 GB por checkpoint de DiffMLP |

## Arquitectura y entrenamiento

Nahual es un transformer causal que opera sobre una secuencia de tokens mixta: cada token representa un fragmento de texto o un número atómico, y en el caso de los átomos va acompañado de una posición 3D en ángstroms. El modelo predice el siguiente token discreto con el transformer principal; cuando el token es un átomo, un segundo transformer causal genera su posición mediante difusión, condicionado a la secuencia limpia generada hasta ese momento (next-token diffusion). La variante DiffMLP sustituye ese segundo transformer por un MLP de difusión por token y se entrena de la misma forma, lo que permite aislar la contribución del componente de difusión secuencial.

Ambos modelos se entrenaron desde Qwen3-0.6B durante 115 000 pasos en 32 GPUs, con 24 480 tokens empaquetados por GPU y paso (un total de 90,1B tokens). Se usó AdamW con tasa de aprendizaje 4e-4, 5 000 pasos de warmup, tasa constante hasta el paso 110 000 y 5 000 pasos de decaimiento lineal, con pérdida calculada solo sobre los tokens de respuesta y EMA con decaimiento 0,999. La mezcla de datos de entrenamiento está definida en `configs/datamix.json` del repositorio de código. Los checkpoints incluyen pesos del modelo, EMA, estado del optimizador y scheduler, y configuración; la inferencia y evaluación usan los pesos EMA.

## Capacidades

- Generación de texto científico y de estructuras 3D de moléculas, cristales y superficies en un mismo formato de secuencia.
- Predicción de estados de transición (tarea T1x) con generación de geometrías de reactivo, producto y estado de transición.
- Búsqueda de conformeros y generación de conformaciones moleculares (GEOM-DRUGS).
- Predicción de estructura cristalina a partir de composición (MP-20).
- Generación de moléculas condicionada por propiedades (QM9) con oráculos EGNN.
- Predicción de adsorción en superficies metálicas, aleaciones y materiales porosos (Alloy, FG, OCD, ODAC25, CoRE MOF).
- Cálculo de propiedades de materiales: volumen de poro, área superficial, bandgap (QMOF) y propiedades moleculares QM9 (polarizabilidad, gap HOMO-LUMO, momento dipolar, capacidad calorífica).
- Microsolvatación y modelado de complejos metálicos (LnQM).
- Generación de trayectorias de banda elástica (nudged elastic band).
- Soporte de prompts multimodales texto/XYZ mediante segmentos JSON con números atómicos y coordenadas.
- Inferencia con múltiples muestras por prompt (`--samples`) y pasos de difusión configurables (`--steps`).

## Casos de uso

- Predicción de estructura cristalina en descubrimiento de materiales: dado un compuesto, el modelo genera estructuras candidatas y permite filtrar por match rate; es adecuado porque supera al estado del arte en MP-20 con MatchRate@20 de 79,9.
- Búsqueda de conformeros en drug discovery: para una molécula dada, genera un conjunto de conformaciones 3D con alta cobertura (COV-R@0,75 Å de 95,4 en GEOM-DRUGS), útil en docking y cribado virtual.
- Generación condicionada por propiedades en diseño molecular: permite muestrear moléculas que satisfagan valores objetivo de polarizabilidad, gap HOMO-LUMO o momento dipolar, con evaluación mediante oráculos EGNN incluidos en el repositorio.
- Cálculo de estados de transición y rutas de reacción: genera geometrías de estados de transición y trayectorias NEB para estudios de mecanismos, con un RMSD mediano de 0,197 Å en T1x.
- Modelado de adsorción en catálisis heterogénea: predice geometrías de adsorbato sobre superficies metálicas y aleaciones (adsRMSD@1 de 0,438 en Alloy), útil para cribado de catalizadores.
- Caracterización de materiales porosos: estima volumen de poro y área superficial en MOF (MAE de 0,115 cm³/g y 470 m²/g en CoRE MOF) para priorizar estructuras en bases de datos.
- Evaluación de complejos metálicos y microsolvatación: modela entornos de solvatación y coordinación metálica (ConnectivityMatch@1 de 73,3 en LnQM; EwT@10 de 50,6 en QCG-10).

## Benchmarks y rendimiento

Resultados sobre conjuntos de test completos (microsolvatación: primeros 500 de 1 135 prompts), media ± error estándar sobre dos semillas, según la model card.

| Tarea / metrica | Nahual | DiffMLP | Prompts de test |
|---|---|---|---|
| Estado de transición (T1x) RMSD@1 mediano ↓ | 0,197 ± 0,013 | 0,247 ± 0,004 | 1073 |
| No covalente (NCI Atlas) RMSD@10 mediano ↓ | 0,335 ± 0,039 | 0,442 ± 0,009 | 149 |
| Complejos metálicos (LnQM) ConnectivityMatch@1 ↑ | 73,3 ± 1,1 | 73,5 ± 0,3 | 488 |
| Microsolvatación (QCG-10) EwT@10 ↑ | 50,6 ± 0,2 | 43,0 ± 1,4 | 500 |
| Estructura cristalina (MP-20) MatchRate@20 ↑ | 79,9 ± 0,1 | 76,5 ± 0,3 | 9046 |
| Conformeros (GEOM-DRUGS) COV-R@0,75 Å mediano ↑ | 95,4 ± 0,1 | 93,0 ± 0,3 | 932 |
| Aleaciones adsRMSD@1 mediano ↓ | 0,438 ± 0,055 | 0,810 ± 0,111 | 1126 |
| FG adsRMSD@1 mediano ↓ | 0,230 ± <0,001 | 0,255 ± 0,001 | 305 |
| OCD adsRMSD@1 mediano ↓ | 4,384 ± 0,114 | 4,308 ± 0,092 | 98 |
| ODAC25 adsRMSD@1 mediano ↓ | 4,15 ± 0,48 | 4,39 ± 0,01 | 270 |
| CoRE MOF volumen de poro MAE (cm³/g) ↓ | 0,115 ± 0,002 | 0,114 ± 0,003 | 1014 |
| CoRE MOF área superficial MAE (m²/g) ↓ | 470 ± 7 | 451 ± 6 | 1014 |
| QMOF bandgap MAE (eV) ↓ | 0,465 ± 0,003 | 0,668 ± 0,210 | 2037 |
| QM9 α MAE (Bohr³) ↓ | 0,523 ± 0,016 | 0,524 ± 0,013 | 13083 |
| QM9 Δε MAE (meV) ↓ | 165 ± 1 | 160 ± 4 | 13083 |
| QM9 ε_HOMO MAE (meV) ↓ | 126 ± <1 | 123 ± 4 | 13083 |
| QM9 ε_LUMO MAE (meV) ↓ | 136 ± 1 | 130 ± 1 | 13083 |
| QM9 μ MAE (D) ↓ | 0,459 ± 0,001 | 0,330 ± 0,111 | 13083 |
| QM9 C_v MAE (cal/mol·K) ↓ | 0,245 ± 0,014 | 0,216 ± 0,003 | 13083 |
| QM9 condicional α EGNN-MAE self-reward@5 (Bohr³) ↓ | 0,578 ± 0,005 | 0,423 ± 0,006 | 50000 |
| QM9 condicional Δε EGNN-MAE self-reward@5 (meV) ↓ | 123,8 ± 0,4 | 99,7 ± 1,3 | 50000 |
| QM9 condicional ε_HOMO EGNN-MAE self-reward@5 (meV) ↓ | 85,0 ± 0,1 | 67,1 ± 0,4 | 50000 |
| QM9 condicional ε_LUMO EGNN-MAE self-reward@5 | datos truncados en la model card | datos truncados en la model card | 50000 |

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint de Nahual ocupa 25 GB en precisión de entrenamiento (sin cuantización), por lo que se requiere al menos una GPU de 32 GB o reparto multi-GPU para carga completa.
- DiffMLP requiere 21 GB por checkpoint, ligeramente inferior.
- GPUs recomendadas: A100 (40/80 GB), H100 (80 GB) o GPUs con 32 GB o más para cargar el checkpoint completo; el modelo se entrenó en 32 GPUs.
- GPU de consumo: no cabe en GPUs consumer de 16 GB o menos sin cuantización; no se documentan formatos cuantizados en la información disponible.
- Opciones de despliegue: el repositorio proporciona inferencia nativa (`python -m nahual.infer`) y un visor en navegador (`scripts/viewer/`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nahual | 1,58B | No disponible | Secuencia texto + átomos 3D con difusión | Apache 2.0 | Hugging Face + GitHub |
| DiffMLP (ablación del paper) | 1,31B | No disponible | Igual que Nahual pero con MLP de difusión por token | Apache 2.0 | Hugging Face + GitHub |
| Qwen3-0.6B (modelo base) | 0,6B | No disponible | LLM de texto | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de comparativas numéricas con modelos especialistas externos (por ejemplo, modelos de predicción de estructura cristalina o de generación molecular condicionada); la model card afirma que Nahual supera al estado del arte en MP-20 y QM9 condicional, pero no incluye los valores de los modelos comparados.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al entrenarse sobre datos científicos, puede heredar sesgos de composición de los datasets de química y materiales.
- Riesgo de alucinación en la generación de estructuras: las geometrías generadas pueden ser físicamente inválidas o no corresponder a mínimos locales; se recomienda validación con métodos de química computacional (DFT, xTB) antes de su uso en producción.
- El rendimiento en algunas tareas es limitado: OCD y ODAC25 presentan adsRMSD@1 de 4,384 y 4,15 respectivamente, muy superiores a los de Alloy y FG, lo que indica dificultad en esos entornos de adsorción.
- En QM9 condicional, DiffMLP supera a Nahual en varias propiedades (α, Δε, ε_HOMO, ε_LUMO), por lo que la elección de variante depende de la tarea.
- No se documentan los idiomas soportados ni la longitud de contexto; el modelo está orientado a texto científico y estructuras 3D, no a conversación general multilingüe.
- No se documentan formatos cuantizados ni soporte para motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp), lo que limita el despliegue en producción.
- El repositorio ocupa 105,9 GB, con checkpoints de 25 GB por semilla y variante; el almacenamiento y la transferencia son costosos.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los datos de entrenamiento y de los assets incluidos (QM9, oráculos EGNN de Bao et al., 2023).

## Enlaces

- Hugging Face: https://huggingface.co/the-matter-lab/nahual
- Repositorio de código: https://github.com/the-matter-lab/nahual
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper: *Nahual: A Sequence Model for Language and Atoms* (NeurIPS 2026), referencia en la model card sin enlace directo disponible
- Dataset QM9 (Ramakrishnan et al., 2014): referenciado en `assets/qm9/`, sin enlace directo en la información proporcionada
- Oráculos EGNN (Bao et al., 2023): referenciados en `assets/egnn_oracles/`, sin enlace directo en la información proporcionada
