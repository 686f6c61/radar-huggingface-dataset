# vv137/deepfold3

## Resumen
DeepFold3 es un predictor de estructura de complejos biomoleculares desarrollado por el usuario vv137 y publicado en Hugging Face. Se presenta como una reimplementación arquitectónicamente equivalente a AlphaFold 3, implementada en PyTorch y distribuida exclusivamente como pesos entrenados en formato `.safetensors`. El modelo resuelve el problema de predecir la estructura tridimensional de complejos proteína-proteína, proteína-ligando y otras combinaciones biomoleculares a partir de sus secuencias y especificaciones químicas.

La relevancia de este lanzamiento reside en que ofrece pesos de AlphaFold 3 fuera de los cauces oficiales de Google DeepMind, con una arquitectura modificada (sin triangle attention ni single track en el trunk) que reduce el coste computacional manteniendo el pipeline de difusión y las cabezas de confianza. Los checkpoints publicados incluyen una etapa inicial entrenada con recortes de 512 tokens y una etapa posterior con recortes de 640 tokens y 8.640 átomos, lo que permite inferencia tanto de monómeros largos como de complejos multiméricos.

El repositorio ocupa 2,5 GB y contiene dos snapshots EMA en fp32 de aproximadamente 310 millones de parámetros cada uno. No hay información publicada sobre licencia, idiomas ni pipeline en la model card, lo que limita su uso comercial directo sin verificación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con trunk PairFormer (TriMulOutgoing + TriMulIncoming + FFN), módulo MSA, diffusion transformer y cabezas de confianza |
| Parametros totales | 310.190.170 (df3-stage1-r19) / 310.190.682 (stage3-s1-001) en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de estructura, no de texto); recortes de entrenamiento de 512 tokens (etapa 1) y 640 tokens / 8.640 átomos (etapa 3) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32) |
| Idiomas soportados | no disponible (modelo biomolecular, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `ModelConfig` embebido como JSON en la cabecera `model_cfg_json`) |

## Arquitectura y entrenamiento
La arquitectura sigue el esquema de AlphaFold 3 pero con modificaciones en el trunk: cada bloque PairFormer está compuesto por TriMulOutgoing, TriMulIncoming (TriangleMul simple de AF3) y una FFN, eliminando la atención triangular y el single track presentes en AF3. El acondicionamiento de difusión no consume el single del trunk (`conditioning_use_trunk_single: false`). Los PairFormers de la cabeza de confianza y de plantillas se mantienen idénticos a AF3. Los canales son 256 para pair, 384 para single y 128 para MSA, con 48 capas en el PairFormer, 4 capas en el módulo MSA, 24 bloques en el diffusion transformer, 4 capas en el PairFormer de confianza y 10 reciclajes.

El entrenamiento se realizó en dos fases principales. La etapa 0 partió de cero hasta el paso 71.000; la etapa 1 continuó con recortes de 512 tokens, pérdida de enlace activada y pérdida de complementariedad de forma de 0,03, usando AdamW con lr 9e-4, decaimiento EMA de 0,999 y 112 GPUs. La mezcla de datos en el paso 120k fue: OpenFold3 `pdb_training_set` (0,5), monómeros largos OF3 (0,2), AFDB de NVIDIA (0,15), TEDdymer (0,1) y monómeros cortos OF3 (0,05). La etapa 3 continuó desde el paso 120.000 con recortes de 640 tokens y 8.640 átomos, 48 niveles de ruido por recorte, calentamiento lineal de 1.000 pasos hasta 9e-4 y decaimiento lineal hasta 0 en el paso 5.000, entrenada en 64 nodos KISTI Hangang GH200 (256 GPUs) con semilla 303. La exportación verifica equivalencia bit a bit con el shadow EMA del checkpoint y carga sin claves faltantes ni inesperadas.

## Capacidades
- Predicción de estructura 3D de complejos biomoleculares (proteína-proteína, proteína-ligando, proteína-ácido nucleico) mediante difusión.
- Generación de múltiples muestras por entrada (la evaluación DB5.5 usa 5 semillas × 5 muestras).
- Estimación de confianza por residuo y por par de residuos mediante la cabeza de confianza de AF3.
- Uso de plantillas estructurales (templates) para guiar la predicción.
- Manejo de monómeros largos y complejos multiméricos gracias a los recortes de 640 tokens / 8.640 átomos de la etapa 3.
- Inferencia sin guiado (unguided) en el checkpoint de etapa 3, ya que no se aplicó dropout de acondicionamiento del par del trunk.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo biomolecular especializado.

## Casos de uso
- Predicción de estructuras de complejos proteína-proteína para estudios de interacción molecular: se ejecuta `deepfold3 inference` con un JSON de entrada que describe las cadenas y se obtienen coordenadas 3D con estimaciones de confianza por residuo.
- Modelado de unión proteína-ligando en descubrimiento de fármacos: el pipeline de difusión condicionada por la especificación química del ligando permite generar poses plausibles para cribado inicial.
- Predicción de monómeros largos: la mezcla de datos incluye monómeros largos de OpenFold3 (peso 0,2), lo que hace al modelo adecuado para proteínas de gran tamaño que no caben en recortes pequeños.
- Benchmarking de docking: el checkpoint stage3-s1-001 se usa como baseline en Docking Benchmark 5.5 con 257 complejos, 5 semillas × 5 muestras y plantillas liberadas al menos 60 días antes de cada diana, lo que lo convierte en referencia para evaluar otros métodos de docking.
- Validación de estructuras experimentales: las cabezas de confianza permiten priorizar residuos mal modelados y comparar con densidades de crio-EM o cristalografía.
- Investigación sobre arquitecturas de predicción estructural: la variante sin triangle attention ni single track permite estudiar el impacto de estas simplificaciones frente a AF3 canónico.
- Reentrenamiento y fine-tuning: al ser pesos PyTorch con `ModelConfig` embebido, el modelo se puede cargar en `DeepFold3` y adaptar a dominios específicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona únicamente que el checkpoint stage3-s1-001 se usó como baseline en Docking Benchmark 5.5 (257 complejos, 5 semillas × 5 muestras), pero no se incluyen cifras de éxito, RMSD ni comparaciones numéricas con AF3 u otros métodos.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en fp32 suman aproximadamente 1,24 GB (310 M parámetros × 4 bytes); el pico de VRAM depende del tamaño del complejo, del número de muestras de difusión y de los 10 reciclajes, por lo que para complejos grandes se recomienda al menos 24-48 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, GH200 (usada en entrenamiento con 256 GPUs), y RTX 4090 24 GB para complejos pequeños o medianos.
- Cabe en consumer GPU: sí para complejos pequeños y medianos en RTX 4090 o RTX 3090; complejos grandes con 8.640 átomos pueden requerir GPUs de datacenter.
- Opciones de despliegue: CLI `deepfold3 inference` con `--params` apuntando al `.safetensors`, y `deepfold3 export --snapshot auto|shadow` para exportar desde checkpoints `.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / recorte | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepFold3 (df3-stage1-r19) | 310.190.170 | 512 tokens / 6.912 átomos | no disponible | Pesos en HF (vv137/deepfold3) |
| DeepFold3 (stage3-s1-001) | 310.190.682 | 640 tokens / 8.640 átomos | no disponible | Pesos en HF (vv137/deepfold3) |
| AlphaFold 3 (referencia oficial) | no disponible en la información | no disponible en la información | no disponible en la información | No distribuido como pesos abiertos por DeepMind |
| OpenFold3 | no disponible en la información | no disponible en la información | no disponible en la información | Usado como fuente de datos de entrenamiento (mezcla `pdb_training_set`, monómeros largos y cortos) |

La comparativa numérica de rendimiento frente a AlphaFold 3 u OpenFold3 no está disponible en la información proporcionada.

## Limitaciones y advertencias
- Licencia no declarada: no se especifica licencia en la model card ni en los metadatos de Hugging Face, por lo que el uso comercial requiere verificación legal previa.
- Riesgo de alucinación estructural: como todo modelo generativo de estructuras, puede producir conformaciones plausibles pero incorrectas; deben consultarse las salidas de confianza.
- Sesgo de datos: la mezcla de entrenamiento está dominada por PDB (0,5) y monómeros de OpenFold3 (0,25 en total), lo que puede infrarepresentar ciertas familias proteicas o ligandos poco presentes en PDB.
- Fuga temporal en benchmarks: la mayoría de complejos de DB5.5 son anteriores al corte de PDB del 30 de septiembre de 2021, por lo que ese benchmark es un baseline y no un test held-out.
- El checkpoint stage3-s1-001 está pensado para inferencia sin guiado; su uso con acondicionamiento guiado puede degradar resultados porque no se aplicó dropout del par del trunk.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento textual ni generación de código; su ámbito es exclusivamente biomolecular.
- Ausencia de benchmarks publicados: no hay cifras de MMLU, HumanEval, GSM8K ni métricas estructurales (RMSD, lDDT, TM-score) en la información disponible, lo que dificulta la comparación objetiva.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/vv137/deepfold3
- Repositorio de pesos (descarga vía `hf download`): https://huggingface.co/vv137/deepfold3/tree/main
- Referencia arquitectónica: AlphaFold 3 (DeepMind), sin enlace oficial de pesos abiertos en la información disponible.
- Dataset de entrenamiento citado: OpenFold3 `pdb_training_set`, AFDB (NVIDIA), TEDdymer (sin enlaces directos en la información disponible).
- Benchmark citado: Docking Benchmark 5.5 (sin enlace directo en la información disponible).
