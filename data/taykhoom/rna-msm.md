# Taykhoom/RNA-MSM

## Resumen

RNA-MSM es un modelo de lenguaje para ARN basado en alineamientos múltiples de secuencias (MSA), desarrollado originalmente por el grupo de Yikun Zhang y colaboradores (artículo en Nucleic Acids Research 2024) y convertido a formato HuggingFace por Taykhoom. El modelo está diseñado para aprender representaciones de secuencias de ARN a partir de alineamientos de homólogos, lo que permite capturar información evolutiva y estructural sin necesidad de etiquetas supervisadas. Su arquitectura axial de tipo MSA Transformer combina atención por filas (posiciones de secuencia) y por columnas (filas del alineamiento), reduciendo la complejidad computacional frente a la atención convencional.

Con 95,9 millones de parámetros y una ventana de contexto de 1024 tokens por secuencia y hasta 1024 filas de alineamiento, RNA-MSM es un modelo compacto y eficiente para tareas de biología computacional como predicción de estructura secundaria, accesibilidad al solvente y generación de embeddings de ARN. Su licencia MIT permite uso comercial sin restricciones, y su formato safetensors con código personalizado facilita su integración en pipelines de transformers. La relevancia actual radica en la creciente demanda de modelos de ARN específicos frente a soluciones genéricas de ADN o proteínas, especialmente en el contexto de terapias basadas en ARN y diseño de aptámeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Axial MSA Transformer (row + column self-attention) |
| Parametros totales | 95.911.180 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens por secuencia; hasta 1024 filas de alineamiento |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | no aplica (modelo biologico de secuencias de ARN) |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo personalizado en transformers) |

## Arquitectura y entrenamiento

RNA-MSM emplea una arquitectura de tipo BERT adaptada a datos MSA. Cada capa transformer (10 en total) aplica dos tipos de atención axial: atención por filas, que atiende a las posiciones de la secuencia sumando sobre las filas del alineamiento, y atención por columnas, que atiende a las filas del alineamiento para cada posición. Esta combinación reduce la complejidad computacional de O(n²·m²) a O(n²·m + n·m²), donde n es la longitud de secuencia y m el número de alineamientos. El modelo utiliza embeddings posicionales aprendidos para la secuencia y un embedding escalar aprendido para la fila del alineamiento, con normalización Pre-LayerNorm y una capa final de LayerNorm.

El entrenamiento se realizó con el objetivo de masked language modeling sobre MSAs de ARN homólogo, enmascarando aproximadamente el 15% de los tokens. Los datos provienen de secuencias homólogas de ARN obtenidas mediante el pipeline RNAcmap a partir de bases de datos de ARN no redundantes. El checkpoint público original es `RNA_MSM_pretrained.ckpt`, convertido a formato HuggingFace con verificación de paridad exacta (diferencia máxima absoluta de 0.00 en las 11 representaciones intermedias). No se ha documentado el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo de representación, no generativo.

## Capacidades

- Generacion de embeddings por token y por secuencia para ARN, con salida 4D `(batch, num_alignments, seqlen, embed_dim)`.
- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de ARN, con vocabulario de 12 tokens (A, G, C, U, X, N, gap, etc.).
- Procesamiento de MSAs completos: acepta alineamientos múltiples de secuencias homólogas de igual longitud.
- Extraccion de representaciones de capas intermedias (11 niveles: embedding + 10 capas transformer) para tareas downstream.
- Mapas de atencion por filas que correlacionan con estructura secundaria y accesibilidad al solvente sin entrenamiento supervisado.
- Fine-tuning para tareas de estructura secundaria, accesibilidad al solvente y otras predicciones estructurales.
- Soporte de secuencias individuales tratadas como MSAs de una sola fila.

## Casos de uso

- Prediccion de estructura secundaria de ARN: los mapas de atencion del modelo pueden usarse directamente como caracteristicas para entrenar cabezales de prediccion, superando a tecnicas estado del arte segun el articulo original.
- Prediccion de accesibilidad al solvente: los embeddings de la fila de consulta (fila 0) sirven como entrada para clasificadores que estiman la exposicion de cada nucleotido.
- Generacion de embeddings para clustering de familias de ARN no codificante: la representacion de secuencia media-pooled permite agrupar secuencias homologas sin alineamiento explicito.
- Deteccion de elementos funcionales conservados: al entrenar con MSAs, el modelo resalta posiciones evolutivamente conservadas, util para identificar motivos regulatorios.
- Fine-tuning para clasificacion de tipos de ARN (miRNA, lncRNA, snoRNA, etc.): el modelo puede adaptarse con una capa de clasificacion sobre el embedding de secuencia.
- Integracion en pipelines de diseno de aptameros: los embeddings de RNA-MSM pueden combinarse con metodos de optimizacion para seleccionar variantes con mayor afinidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo original (Zhang et al., 2024) reporta mejoras en prediccion de estructura secundaria y accesibilidad al solvente frente a tecnicas previas, pero no se incluyen tablas numericas en la documentacion de HuggingFace. Se recomienda consultar la publicacion en Nucleic Acids Research para datos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 95,9 millones de parametros en precision FP32, el modelo ocupa aproximadamente 384 MB en memoria. Con cuantizacion a FP16 o int8, el uso de VRAM se reduce a unos 200-100 MB, aunque no se proporcionan archivos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lotes pequenos. Una RTX 3060 o superior permite procesar MSAs de hasta 1024 filas sin problemas.
- Compatibilidad con GPU consumer: si, el modelo cabe en GPUs de gama de entrada (GTX 1060 6GB, RTX 2060, etc.) gracias a su tamano reducido.
- Opciones de despliegue: al usar codigo personalizado de transformers, se puede ejecutar con la libreria transformers estandar. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que el modelo no es generativo y requiere la implementacion axial personalizada.
- Latencia y throughput: no disponible. Depende del hardware y del tamano del MSA; para una secuencia unica de 100 nucleotidos, la inferencia es del orden de milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos en la informacion proporcionada. Existen otros modelos de lenguaje para ARN como RNA-FM (de la Universidad de Tsinghua) y DNABERT-2 (para ADN), pero no se han encontrado comparaciones directas publicadas en la documentacion de RNA-MSM. Se recomienda consultar el articulo original para una comparativa cualitativa con metodos basados en energia libre y otros modelos de ARN.

## Limitaciones y advertencias

- El modelo esta disenado para ARN, no para ADN ni proteinas; su vocabulario limitado a 12 tokens impide su uso en otros dominios biologicos.
- La atencion axial no es compatible con implementaciones optimizadas como `sdpa` o `flash_attention_2`; solo funciona con atencion eager, lo que puede limitar el rendimiento en GPUs muy grandes.
- La salida 4D puede resultar confusa para usuarios acostumbrados a modelos de secuencia estandar; requiere manejo explicito de la dimension de alineamiento.
- No se han documentado sesgos especificos, pero al entrenarse con secuencias homologas de bases de datos no redundantes, puede estar sesgado hacia familias de ARN bien representadas.
- Riesgo de alucinacion: al ser un modelo de representacion y no generativo, el riesgo de alucinacion es bajo, pero los embeddings pueden no capturar interacciones de largo alcance en ARN con estructuras complejas.
- La licencia MIT permite uso comercial, pero el codigo personalizado requiere `trust_remote_code=True`, lo que implica ejecutar codigo externo; se recomienda auditar el codigo antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Taykhoom/RNA-MSM
- Repositorio original en GitHub: https://github.com/yikunpku/RNA-MSM
- Documentacion en MultiMolecule: https://multimolecule.danling.org/models/rnamsm/
- Checkpoint original (Google Drive): https://drive.google.com/file/d/11A-S13qAb5wiBi1YLs3EOrnixSDq7Q0q/view
- Coleccion RNA-MSM en HuggingFace: https://huggingface.co/collections/Taykhoom/rna-msm-6a18b5c2b0181ebbc71ff777
