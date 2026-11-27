# Xylolabs/clef-flash-Tenstorrent-Tensix

## Resumen

Clef-Flash para Tenstorrent Tensix es una versión cuantizada del modelo Cloudflare/clef-flash, publicada por Xylolabs y optimizada para su ejecución sobre aceleradores NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo generativo conversacional al uso, sino de un modelo de decisión y clasificación de texto que evalúa, en una única pasada hacia delante, todas las opciones permitidas de un conjunto de preguntas estructuradas asociadas a un registro de estado.

La relevancia de esta ficha radica en dos factores. Primero, el modelo base clef-flash de Cloudflare propone un paradigma poco habitual: en lugar de generar texto libre, recibe un estado estructurado (por ejemplo, los campos de una factura) y una batería de preguntas tipadas (elección múltiple, sí/no, etc.), y devuelve distribuciones de probabilidad sobre las opciones válidas. Segundo, esta variante aplica cuantización de bloque en punto flotante (BFP4, con formato bfloat4_b) sobre las proyecciones de atención, DeltaNet y MLP, manteniendo el resto en bf16, lo que reduce el peso empaquetado a 9,12 GB y permite desplegarlo en hardware Tensix.

El resultado es un artefacto muy especializado: licencia Apache 2.0, idiomas inglés y coreano, formato safetensors con código personalizado y un pipeline declarado de text-classification. Su interés es fundamentalmente de infraestructura: demuestra cómo llevar un modelo de decisión con atención híbrida a NPUs de Tenstorrent con una degradación de calidad medida (KL medio de 0,0085 frente a BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y capas DeltaNet (modelo de decisión sobre estado estructurado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como cifra oficial; los registros evaluados van de 152 a 16.384 tokens |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en atención, DeltaNet y MLP; resto en bf16; opción de empaquetado BFP8 |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `bfp4/`), con código personalizado de carga |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef-flash emplea una arquitectura híbrida que combina mecanismos de atención con capas DeltaNet (una variante de atención lineal con estado recurrente). Esta combinación permite procesar registros largos (hasta 16.384 tokens en la evaluación publicada) manteniendo un coste de memoria más contenido que un transformer de atención completa. La variante de Xylolabs conserva esa topología y solo sustituye los pesos de las proyecciones de atención, DeltaNet y MLP por versiones cuantizadas en bfloat4_b, dejando el resto del backbone y la cabeza en bf16.

Sobre el entrenamiento no se aportan datos en la información disponible: no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de cuantización: se aplica una técnica de cuantización de bloque en punto flotante (BFP) con GPTQ, implementada en el repositorio tensix-bfp-gptq v0.1.0, y se valida mediante comparación de distribuciones. La métrica reportada es la divergencia KL media entre las distribuciones sobre opciones permitidas del modelo cuantizado y el BF16 original, calculada sobre 44 registros, 55 preguntas y 40 preguntas etiquetadas. El resultado es 0,0084616933 para BFP4, frente a 0,0061601562 para un Q4_K_M de llama.cpp sobre el mismo backbone. En aciertos sobre las 40 preguntas etiquetadas, BFP4 obtiene 35/40, el BF16 original 34/40 y el Q4_K_M 33/40.

## Capacidades

- Clasificación y decisión sobre opciones cerradas: evalúa todas las opciones permitidas de cada pregunta en una sola pasada, devolviendo logits y probabilidades por opción.
- Preguntas de elección múltiple (`choice`) con criterios explícitos por opción.
- Preguntas de tipo `noul` (sí/no y variantes binarias) sobre el estado del registro.
- Procesamiento de registros estructurados de estado (por ejemplo, objetos JSON con campos anidados como facturas, proveedores, importes y estados).
- Manejo de contextos de hasta 16.384 tokens en los registros evaluados, adecuado para documentos o estados extensos.
- Soporte multilingüe limitado a inglés y coreano.
- Ejecución sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con layout de matriz [in, out] y tipos bfloat4_b/bfloat8_b.
- No se documentan capacidades de generación de texto libre, tool calling, agentes, visión ni audio.

## Casos de uso

- Validación y clasificación de facturas: el modelo recibe el estado estructurado de una factura (proveedor, importe, moneda, estado) y responde preguntas tipadas como "¿cuál es el estado?" o "¿el total supera 1000 USD?", devolviendo probabilidades por opción en una sola pasada.
- Enrutamiento de documentos en pipelines de back office: dado un registro con campos extraídos, decidir la categoría o el siguiente paso del flujo (pagado, vencido, borrador) sin generar texto, lo que simplifica la integración y el registro de auditoría.
- Extracción de decisiones auditables: al evaluar opciones cerradas, cada respuesta lleva asociada una distribución de probabilidad, lo que facilita umbrales de confianza y revisión humana en procesos regulados.
- Despliegue en infraestructura Tenstorrent: organizaciones con NPUs Wormhole o Blackhole pueden ejecutar el modelo con TT-NN, aprovechando el empaquetado BFP4 de 9,12 GB y evitando depender de GPU convencionales.
- Procesamiento de registros largos: con registros de hasta 16.384 tokens, es adecuado para estados documentales extensos donde un clasificador por ventanas perdería contexto global.
- Evaluación comparativa de cuantización: sirve como referencia para medir el impacto de BFP4 frente a BF16 y Q4_K_M en tareas de decisión, usando la KL media y el número de aciertos como métricas.
- Clasificación de texto en inglés y coreano: útil en entornos bilingües donde se requiera decidir entre categorías predefinidas sobre contenido en esos dos idiomas.

## Benchmarks y rendimiento

| Metrica | BFP4 (este modelo) | BF16 original | Q4_K_M llama.cpp |
|---|---|---|---|
| KL media a BF16 | 0,0084616933 | 0 (referencia) | 0,0061601562 |
| Aciertos (40 preguntas etiquetadas) | 35/40 | 34/40 | 33/40 |
| Tamano empaquetado | 9,12 GB | no disponible | no disponible |

La comparación se realiza sobre los mismos 44 registros, 55 preguntas y 40 preguntas etiquetadas, con longitudes de registro entre 152 y 16.384 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso empaquetado BFP4 ocupa 9,12 GB; en ejecución sobre GPU con Transformers y CUDA se debe sumar la memoria de activaciones y del resto del backbone en bf16, por lo que se recomienda al menos 16-24 GB de VRAM.
- GPU recomendadas: para la ruta CUDA con Transformers 5.23.0, GPUs de 24 GB o más (RTX 4090, L40S, A100, H100). Para la ruta nativa, NPUs Tenstorrent Wormhole y Blackhole.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090, siempre que se ajuste el tamaño de batch y la longitud de los registros.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch y CUDA para la ruta de referencia; TT-NN/tt-metal para Tensix; scripts `pack_tensix.py` y `verify_grid.py` para empaquetado y verificación en el dispositivo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Xylolabs/clef-flash-Tenstorrent-Tensix | Cuantizado BFP4 para Tensix | Registros hasta 16.384 tokens en evaluación | Apache 2.0 | Hugging Face, 125 descargas | 35/40 aciertos, KL 0,0085 |
| Cloudflare/clef-flash (BF16) | Modelo base de decisión | Ídem | Apache 2.0 | Hugging Face | 34/40 aciertos, referencia de calidad |
| Mismo backbone en Q4_K_M (llama.cpp) | Cuantización GGUF de 4 bits | Ídem | Apache 2.0 (del base) | Generado localmente | 33/40 aciertos, KL 0,0062 |

No se dispone de comparaciones con modelos de clasificación o decisión de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión cerrado: no genera texto libre; solo puntúa opciones predefinidas, por lo que no sirve para tareas generativas.
- Idiomas limitados a inglés y coreano; el rendimiento fuera de esos idiomas no está documentado.
- No se especifican sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta de probabilidades en opciones ambiguas; se recomienda umbral de confianza y revisión humana.
- La cuantización BFP4 introduce una degradación medible (KL 0,0085 frente a BF16); en dominios muy sensibles conviene validar con datos propios.
- Requiere código personalizado (`joint_schema_model`) y Transformers 5.23.0; la ruta Tensix exige TT-NN y empaquetado específico, lo que añade complejidad operativa.
- El repositorio pesa 19,1 GB en total aunque la carpeta `bfp4/` ocupe 9,12 GB empaquetados; hay que descargar selectivamente.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE` de cada carpeta y citar la release original de Cloudflare.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/clef-flash-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Herramientas de empaquetado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0/tools
- Documentación de Tenstorrent: https://docs.tenstorrent.com
