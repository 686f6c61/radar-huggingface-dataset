# trucmtnguyen/vi-add-match-bge-m3

## Resumen

vi-add-match-bge-m3 es un modelo de embeddings de texto en vietnamita desarrollado por Truc Mai-Thanh Nguyen, obtenido mediante fine-tuning de BAAI/bge-m3. Su proposito es alinear en el espacio de embeddings direcciones postales historicas de Vietnam con sus equivalentes en el formato administrativo actualizado, en el contexto de la reorganizacion administrativa de 2025. Resuelve el problema de la recuperacion de candidatos cuando una direccion antigua debe mapearse a su version vigente.

Tecnicamente es un bi-encoder de pesos compartidos con backbone XLM-RoBERTa, pooling CLS seguido de normalizacion L2 y salida de 1.024 dimensiones. Cuenta con 567.754.752 parametros y una longitud maxima de secuencia de solo 128 tokens, lo que lo limita a direcciones cortas. Se entreno con 74.260 pares `anchor`-`positive` usando Multiple Negatives Ranking Loss durante 2 epocas.

Es relevante como linea base de investigacion para representacion de texto geografico temporal y como componente de generacion de candidatos en pipelines de normalizacion de direcciones. No es un geocodificador ni un servicio de conversion administrativa autoritativa: sus puntuaciones indican similitud de embeddings, no probabilidad calibrada de equivalencia geografica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder de pesos compartidos (backbone XLM-RoBERTa), pooling CLS + normalizacion L2 |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un bi-encoder denso de Sentence Transformers construido sobre BAAI/bge-m3 (revision registrada `5617a9f61b028005a4858fdac845db406aefb181`), cuyo backbone es XLM-RoBERTa. Emplea pooling CLS seguido de normalizacion L2, produciendo vectores de 1.024 dimensiones comparables mediante similitud coseno o producto escalar. La longitud maxima de secuencia es de 128 tokens.

El entrenamiento se realizo sobre 74.260 pares de cadenas de direccion vietnamitas, donde `anchor` es la direccion en formato administrativo historico y `positive` la correspondiente en formato actualizado, procedentes del dataset trucmtnguyen/vietnam-address-collection. Se uso MultipleNegativesRankingLoss con 2 epocas, batch size 4 por dispositivo, acumulacion de gradientes de 8 (32 ejemplos efectivos por paso de optimizador en un solo dispositivo), learning rate 2e-5, optimizador adamw_torch_fused, scheduler lineal con warmup ratio 0,1, precision BF16, norma maxima de gradiente 1.0, semilla 42 y batch sampler `no_duplicates`. No se registro gradient checkpointing en el export final del entrenamiento. El objetivo solo usa pares de texto: no incluye encoder de coordenadas, perdida de distancia geografica, intervalos de validez temporal ni topologia de poligonos.

## Capacidades

- Generacion de embeddings densos de texto de 1.024 dimensiones para direcciones en vietnamita.
- Recuperacion de candidatos: dada una direccion historica, devuelve las direcciones actualizadas mas similares por similitud coseno.
- Matching historico-actual: alinea cadenas con etiquetas administrativas distintas (por ejemplo, con o sin nivel de distrito).
- Generacion de candidatos para estandarizacion de direcciones y deduplicacion.
- Geographic entity linking a nivel textual, como componente previo a verificacion.
- Linea base de investigacion para aprendizaje de representaciones de texto geografico temporal.
- Solo texto; no procesa coordenadas, poligonos ni imagenes.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no generativo.

## Casos de uso

- Normalizacion de direcciones en bases de datos heredadas: indexar el catalogo de direcciones actuales con el modelo y consultar con direcciones historicas para obtener candidatos que un humano o una regla posterior verifique contra el crosswalk administrativo oficial.
- Deduplicacion de registros de clientes: generar embeddings de todas las direcciones de un CRM y agrupar por similitud para detectar duplicados que difieren solo en la etiqueta administrativa (por ejemplo, presencia o ausencia de "Huyen An Phu").
- Enriquecimiento de datos geoespaciales: en pipelines ETL, usar el modelo como etapa de candidate generation antes de resolver la entidad contra una base de datos espacial versionada.
- Busqueda de direcciones en portales de servicios publicos: permitir que un ciudadano introduzca una direccion antigua y el sistema sugiera las direcciones vigentes mas probables para su seleccion.
- Investigacion en representacion de texto geografico temporal: servir como baseline reproducible para comparar tecnicas de alineamiento historico-actual en vietnamita.
- Limpieza de datasets historicos: emparejar registros de censos o padrones antiguos con registros actuales para estudios demograficos, siempre con validacion posterior.
- Preprocesado para geocodificacion: reducir el espacio de busqueda a un conjunto pequeno de candidatos textuales antes de invocar un geocodificador con limites de peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 567,7 millones de parametros, en FP16 el peso ocupa aproximadamente 1,1 GB; en FP32, unos 2,3 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en GPUs de 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; para alto throughput, A100, H100, L4 o L40S. Para uso individual, RTX 3060, RTX 4060, RTX 4090.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna con 4 GB o mas; tambien puede ejecutarse en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` y `endpoints_compatible` en el repo), y servidores de embeddings compatibles con la API de Hugging Face. No se documenta soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. La secuencia maxima de 128 tokens reduce el coste por peticion frente a modelos de contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| trucmtnguyen/vi-add-match-bge-m3 | 567.754.752 | 128 tokens | vi | no disponible | Embeddings de direcciones historico-actual (fine-tune) |
| BAAI/bge-m3 | no disponible en la informacion | no disponible en la informacion | multilingue | MIT (segun el modelo base, no verificado en esta ficha) | Embeddings multilingues generalistas |
| Otros fine-tunes de bge-m3 para vietnamita | no disponible | no disponible | vi | no disponible | Embeddings generalistas en vietnamita |

La comparacion con alternativas especificas de matching de direcciones en vietnamita no esta disponible en la informacion proporcionada. Frente a su modelo base BAAI/bge-m3, este fine-tune esta especializado en el dominio de direcciones y limita el contexto a 128 tokens, lo que lo hace mas ligero pero menos adecuado para documentos largos.

## Limitaciones y advertencias

- No es un geocodificador: no predice coordenadas, no mide distancias fisicas, no realiza point-in-polygon ni verifica jurisdicciones.
- Las puntuaciones de similitud no son probabilidades calibradas de equivalencia geografica; un vecino mas cercano no basta para uso legal u operativo.
- Las etiquetas de los pares reflejan los mapeos del dataset de origen; el autor no ha establecido verificacion independiente de cada conversion administrativa.
- El dataset contiene artefactos: prefijos administrativos duplicados (por ejemplo, "Phuong Phuong 12"), ortografia inconsistente y texto truncado, que pueden afectar a las representaciones aprendidas.
- Contexto muy limitado: 128 tokens, insuficiente para direcciones con informacion adicional o documentos completos.
- Solo vietnamita: no se ha entrenado ni evaluado en otros idiomas.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinacion en el sentido de recuperar candidatos plausibles pero administrativamente invalidos en una fecha concreta; requiere verificacion contra crosswalks oficiales y bases de datos espaciales versionadas.
- Sin datos publicados de benchmarks, descargas ni likes en el momento de la consulta; madurez y validacion externa desconocidas.
- No incluye senal temporal explicita: no distingue la validez de una direccion en una fecha concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trucmtnguyen/vi-add-match-bge-m3
- Dataset de entrenamiento: https://huggingface.co/datasets/trucmtnguyen/vietnam-address-collection
- Modelo base: https://huggingface.co/BAAI/bge-m3
