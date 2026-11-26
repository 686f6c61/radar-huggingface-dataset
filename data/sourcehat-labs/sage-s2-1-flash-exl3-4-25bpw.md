# SourceHat-Labs/Sage-S2.1-Flash-EXL3-4.25bpw

## Resumen

Sage-S2.1-Flash-EXL3-4.25bpw es una cuantizacion EXL3 de precision mixta del modelo internlm/Sage-S2.1-Flash, publicada por SourceHat-Labs. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una conversion de pesos que reduce la precision del decodificador principal a 4,25 bits por peso (bpw) de media, manteniendo componentes criticos en 6, 7 y 16 bits. El resultado es un artefacto de 89.077.670.750 parametros totales con un payload de 178,5 GB, pensado para servirse con ExLlamaV3.

El modelo base emplea una arquitectura hibrida con bloques de atencion KDA (Kimi Delta Attention) y DSA (DeepSeek Sparse Attention), una capa MoE con 288 expertos enrutados por bloque, expertos compartidos y pesos MTP (multi-token prediction) integrados. La metadata nativa de contexto se preserva en 1.048.576 tokens. La cuantizacion no aplica abliteration ni modificaciones de comportamiento: solo cambia la precision de los pesos.

Su relevancia practica es que permite desplegar un modelo de casi 90.000 millones de parametros con contexto de un millon de tokens en tres GPU mediante reparto P2P, reduciendo el coste de VRAM frente al BF16 original. La licencia declarada es MIT, lo que facilita el uso comercial, aunque el autor remite a la documentacion upstream para los terminos exactos de pesos y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion KDA y DSA, capas MoE y MTP integrado |
| Parametros totales | 89.077.670.750 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | EXL3 de precision mixta; objetivo principal 4,25 bpw (4,2543856698 bpw asignados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), libreria exllamav3 |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que alterna bloques con atencion KDA y bloques con atencion DSA. Los bloques DSA incorporan un indexador (`indexer.wq_b`) y proyecciones `kv_a_proj_with_mqa`, `q_a` y `q_b`. Las capas feed-forward son de tipo MoE con 288 expertos enrutados por bloque, ademas de expertos compartidos. El decodificador principal ocupa los bloques fisicos 0-44 y el bloque 45 corresponde a los pesos MTP. La cuantizacion conserva los embeddings, la cabeza de salida y los componentes de vision en 16 bits, y copia sin modificar los proyectores cientificos.

El proceso de calibracion usa 128 secuencias de 4.096 tokens: 32 de matematicas, 32 de ciencia, 32 de codigo y 32 de herramientas multi-turno. La cuantizacion principal se ejecuta una sola vez desde el BF16 original. Los pesos MTP se calibran a partir de los estados ocultos principales previos emparejados con el siguiente token de entrada y se almacenan a 8 bits. La asignacion de precision es heterogenea: nueve bloques de expertos enrutados usan 5 bits (bloques fisicos 3, 4, 5 y 39-44), el resto usa 4 bits; atencion y expertos compartidos usan 6 bits, salvo `kv_a_proj_with_mqa` en los bloques 3 y 43, que usa 7 bits; las FFN densas usan 5 bits. No se documenta en la informacion disponible el volumen de tokens de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con ventana nativa de 1.048.576 tokens.
- Razonamiento y resolucion de problemas, segun la mezcla de calibracion declarada (matematicas, ciencia y codigo).
- Generacion de codigo, con calibracion especifica sobre secuencias de codigo.
- Uso de herramientas y function calling, con calibracion sobre trazas multi-turno de herramientas.
- Razonamiento multi-paso y agentes, apoyado por los pesos MTP integrados para decodificacion especulativa.
- Capacidades de vision, dado que el autor menciona componentes de vision retenidos en 16 bits en el inventario de tensores.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 1.048.576 tokens permite mantener historiales de conversacion muy largos y multiples sesiones en un mismo contexto sin truncar, con un coste de VRAM inferior al del BF16 gracias a la cuantizacion a 4,25 bpw.
- Analisis de repositorios completos: el modelo puede recibir grandes volumentes de codigo en una sola pasada y responder preguntas de arquitectura o generar parches, aprovechando la calibracion sobre secuencias de codigo.
- Agentes con tool calling: la calibracion sobre trazas multi-turno de herramientas y los pesos MTP lo hacen adecuado para pipelines de agentes que encadenan llamadas a APIs y razonamiento multi-paso.
- Procesamiento de documentos extensos: contratos, informes tecnicos o expedientes de cientos de miles de tokens pueden analizarse en una unica inferencia, reduciendo la necesidad de chunking y recuperacion.
- Asistencia en investigacion cientifica: la calibracion incluye secuencias de ciencia y matematicas, por lo que puede emplearse para resumir literatura, extraer relaciones y resolver problemas cuantitativos.
- Despliegue en infraestructura limitada: el perfil de referencia con reparto P2P en tres GPU permite servir el modelo en entornos con menos memoria agregada que la requerida por el BF16 completo.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para revision de cambios y generacion de tests, siempre que se validen las salidas antes de aplicarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el payload del modelo es de 178,508 GB (166,248 GiB), excluyendo documentacion y fuentes de runtime. Esa cifra es la referencia minima de memoria agregada para cargar los pesos.
- GPU recomendadas: el perfil de referencia del autor usa un reparto directo P2P en tres GPU; no se especifican modelos concretos en la informacion disponible.
- GPU de consumo: no cabe en una unica GPU de consumo convencional por el tamano del payload; se requiere reparto entre varias GPU o memoria agregada equivalente.
- Opciones de despliegue: ExLlamaV3 (libreria declarada), usando el codigo de serving incluido en `runtime/sage-exl3-serving-source.tar.gz`, el perfil `runtime/REFERENCE-PROFILE.json` y la guia `runtime/SERVING.md`.
- Latencia y throughput: no disponibles. El perfil de referencia menciona un indexador por lotes y ajustes medidos para reducir el uso de CPU, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-EXL3-4.25bpw | 89.077.670.750 | 1.048.576 | EXL3 4,25 bpw mixta | MIT | Hugging Face, 273 descargas |
| internlm/Sage-S2.1-Flash (base) | no disponible | 1.048.576 (segun metadata preservada) | BF16 original | MIT (segun README upstream) | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion altera la precision de los pesos: aunque el autor la describe como "untouched" en cuanto a comportamiento, pueden aparecer degradaciones en tareas sensibles a la precision numerica.
- El bpw de 4,25 es una media: la asignacion real varia por bloque y proyeccion, por lo que el rendimiento no es equivalente a un modelo uniformemente cuantizado a 4 bits.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion en la informacion disponible.
- Los idiomas soportados no estan declarados; no se puede garantizar un rendimiento multilingue sin evaluacion previa.
- La licencia MIT se declara para codigo y pesos, pero el autor remite a `UPSTREAM-LICENSE-NOTICE.md` y al README upstream; conviene revisar esos documentos antes de un uso comercial.
- El despliegue requiere ExLlamaV3 y un reparto multi-GPU; no es compatible directamente con otros runtimes como llama.cpp u Ollama segun la informacion disponible.
- Las trazas de calibracion, las preguntas de benchmark y las generaciones no se distribuyen, lo que limita la reproducibilidad de las evaluaciones.
- El contexto de 1.048.576 tokens es metadata preservada; el rendimiento efectivo a esa longitud no se ha verificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SourceHat-Labs/Sage-S2.1-Flash-EXL3-4.25bpw
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Repositorio de referencia del runtime: incluido en el propio repositorio (`runtime/sage-exl3-serving-source.tar.gz`, `runtime/REFERENCE-PROFILE.json`, `runtime/SERVING.md`)
- Documentacion de licencia upstream: `UPSTREAM-README.md` y `UPSTREAM-LICENSE-NOTICE.md` dentro del repositorio
- Documentacion de precision: `PRECISION-ALLOCATION.csv`, `LAYER-PRECISION.csv`, `TENSOR-INVENTORY.csv`, `quantization_config.json`, `precision-map.json`
- Procedencia y artefactos: `sage-provenance.json`, `artifact-files.json`
