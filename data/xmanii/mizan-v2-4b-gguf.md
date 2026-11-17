# xmanii/Mizan-v2-4B-GGUF

## Resumen

Mizan v2 4B GGUF es la versión cuantizada en formato GGUF de Mizan v2 4B, un modelo de decisión multimodal (texto e imagen) desarrollado por Nimruz y orientado principalmente al persa (farsi), con soporte de inglés. A diferencia de un modelo generativo convencional, Mizan responde preguntas tipadas (elección múltiple, puntuación y sí/no) devolviendo probabilidades calibradas en un único paso forward, a través del endpoint `/v1/systemone` compatible con llama.cpp. Esta build GGUF la publica el usuario xmanii y permite ejecutar el modelo con llama.cpp en hardware modesto.

El modelo resuelve un problema concreto: automatizar decisiones estructuradas sobre texto e imágenes (detección de personas o vehículos en fotogramas de cámara, validación de tickets, clasificación de productos defectuosos) sin necesidad de un LLM generativo grande ni de pipelines separados de visión y razonamiento. Con 4.237.797.892 parámetros totales y una ventana de contexto configurable (el ejemplo de despliegue usa 8.192 tokens), se posiciona como una alternativa ligera para tareas de decisión en producción.

Su relevancia actual radica en la combinación de tres factores: licencia Apache-2.0 para uso comercial, cuantización Q4_K_M que reduce el peso a 2,7 GB (más 0,37 GB del proyector visual) y un rendimiento en texto que prácticamente no se degrada respecto a la versión completa (82,7 % frente a 82,8 % en un benchmark real en persa). Todo ello lo hace desplegable en una GPU de gama de entrada de 8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto-imagen; pesos GGUF para llama.cpp) |
| Parametros totales | 4.237.797.892 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | configurable en llama.cpp; el ejemplo de despliegue usa 8.192 tokens (`-c 8192`) |
| Tipos de cuantizacion | Q8_0 (4,5 GB) y Q4_K_M (2,7 GB); proyector visual mmproj en Q8_0 (0,37 GB) |
| Idiomas soportados | persa (fa) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Nimruz/Mizan-v2-4B (tipo de transformer, composición del dataset, número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO). Lo que sí se especifica es su naturaleza multimodal: el modelo procesa texto e imágenes, y la build GGUF incluye un proyector visual independiente (`mmproj-mizan-v2-4b-Q8_0.gguf`) que solo es necesario cuando se envían imágenes. La model card remite a la tarjeta del modelo principal para los detalles de entrenamiento y los benchmarks completos.

La innovación técnica destacable no está en la arquitectura sino en la interfaz de inferencia: el modelo responde a preguntas tipadas (`choice`, `score`, `noul` para sí/no) devolviendo probabilidades calibradas en un solo paso forward, en lugar de generar texto libre. Esto se expone mediante el endpoint `/v1/systemone` de llama.cpp (compatible con Jev/SystemOne), lo que permite integrar el modelo como un clasificador probabilístico dentro de servicios HTTP. Las imágenes se envían como data URLs base64 en una lista `images` junto al estado y las preguntas.

## Capacidades

- Decisión tipada sobre texto: preguntas de elección múltiple, puntuación y sí/no con probabilidades calibradas.
- Comprensión de imágenes: análisis de fotogramas de cámara, tickets y fotos de producto mediante el proyector visual.
- Detección de presencia: persona en el encuadre, vehículo en el encuadre y tipo de vehículo.
- Análisis de zonas: persona o vehículo dentro de una zona delimitada (zona roja).
- Conteo: número de personas en la imagen.
- Procesamiento de tickets: total por encima de un umbral y extracción de líneas de detalle.
- Inspección de producto: identificación de producto (fábrica) y detección de defectos.
- Multilingüe limitado a persa e inglés.
- Integración con llama.cpp mediante API HTTP compatible con OpenAI-style endpoints y con el endpoint específico `/v1/systemone`.
- No se documenta soporte de tool calling genérico, agentes multi-paso ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Videovigilancia de parking: el modelo analiza fotogramas de cámaras y responde si hay una persona o un vehículo en una zona delimitada, con una precisión balanceada del 95 % y 100 % respectivamente en las pruebas publicadas. Adecuado por su bajo coste por inferencia y su capacidad de ejecutarse en una GPU de 8 GB.
- Control de aforo: conteo de personas en el encuadre (92 % de precisión balanceada en 40 muestras), útil para sistemas de gestión de capacidad en locales o eventos.
- Validación de tickets y gastos: comprobación automática de si el total de un ticket supera un umbral (97 %) y extracción de líneas de detalle (95 %), aplicable a flujos de reembolso o contabilidad.
- Inspección de calidad en fábrica: identificación del producto (100 % en 70 muestras) y detección de defectos (77 % en 150 muestras), para triaje automatizado en línea de producción.
- Clasificación de tipo de vehículo: distinción entre categorías de vehículo (87 % en 44 muestras) para peajes, accesos o análisis de tráfico.
- Procesamiento por lotes en CPU: para trabajos no urgentes, el modelo funciona en CPU a unos 3 segundos por petición de texto en 16 núcleos, lo que permite clasificar grandes volúmenes de documentos o imágenes sin GPU.
- Decisión textual con políticas: el modelo base está orientado a seguir políticas y rúbricas de puntuación (la variante v3 3B es mejor en esto según el autor), por lo que puede emplearse para evaluar respuestas o aplicar criterios de negocio de forma consistente.

## Benchmarks y rendimiento

Resultados publicados en la model card de la build GGUF (muestras pequeñas, entre 12 y 150 por pregunta, con un margen de ±5-10 puntos):

| Prueba | Metrica | Resultado | n |
|---|---|---|---|
| Texto (benchmark real en persa), Q8_0 | precision | 82,8 % | no disponible |
| Texto (benchmark real en persa), Q4_K_M | precision | 82,7 % | no disponible |
| Texto, modelo a precision completa | precision | 82,8 % | no disponible |
| Persona en el encuadre | precision balanceada | 95 % | 51 |
| Vehiculo en el encuadre | precision balanceada | 100 % | 42 |
| Tipo de vehiculo | precision balanceada | 87 % | 44 |
| Persona en zona roja | precision balanceada | 70 % | 12 |
| Vehiculo en zona roja | precision balanceada | 92 % | 16 |
| Numero de personas | precision balanceada | 92 % | 40 |
| Total del ticket por encima de X | precision balanceada | 97 % | 150 |
| Lineas de detalle del ticket | precision balanceada | 95 % | 91 |
| Que producto (fabrica) | precision balanceada | 100 % | 70 |
| Producto defectuoso | precision balanceada | 77 % | 150 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,1 GB para Q4_K_M más el proyector visual Q8_0 (2,7 GB + 0,37 GB); unos 4,9 GB para Q8_0 más el proyector (4,5 GB + 0,37 GB).
- GPU recomendadas: el autor indica que una tarjeta de gama de entrada de 8 GB es suficiente para uso en tiempo real. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con la cuantización Q4_K_M.
- CPU: funciona para trabajos por lotes, con un rendimiento aproximado de 3 segundos por petición de texto en 16 núcleos.
- Despliegue: llama.cpp versión b11443 o superior, mediante `llama-server`. Parámetros de ejemplo: `-c 8192 -b 8192 -ub 8192 -ngl 99`. La opción `-ub` debe cubrir la entrada más larga, incluidos los tokens de imagen.
- Latencia y throughput: no se publican cifras de throughput; solo la estimación de 3 s por petición de texto en CPU con 16 núcleos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mizan v2 4B (esta ficha, GGUF) | 4,24 B | configurable (ejemplo 8.192) | Decision multimodal texto-imagen, persa-first | Apache-2.0 | GGUF en Hugging Face |
| Mizan v3 3B | no disponible | no disponible | Decision solo texto, persa-first | no disponible | Hugging Face (Nimruz) |
| Mizan v2 4B (pesos completos) | 4,24 B | no disponible | Decision multimodal texto-imagen | Apache-2.0 | Hugging Face (Nimruz) |

La model card solo menciona como alternativa dentro de la misma familia a Mizan v3 3B, descrito como más pequeño (1,9 GB en 4 bits), 1,5 veces más rápido y mejor siguiendo políticas y rúbricas de puntuación, pero limitado a texto. No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- Las muestras de los benchmarks visuales son pequeñas (entre 12 y 150 por pregunta), con un margen de error estimado de ±5-10 puntos; los resultados deben interpretarse con cautela.
- La detección de persona en zona roja alcanza solo el 70 % con n=12, un resultado poco fiable y con muestra insuficiente.
- La detección de producto defectuoso se queda en el 77 % (n=150), lo que puede ser insuficiente para inspección de calidad crítica sin revisión humana.
- El autor advierte que el modelo aún no localiza defectos y que existen caveats sobre su uso con CCTV real; los detalles están en la tarjeta del modelo principal.
- El soporte de idiomas se limita a persa e inglés; no se documenta castellano ni otros idiomas.
- Es un modelo de decisión, no un generador de texto libre: no está pensado para conversación abierta, generación de código ni razonamiento multi-paso.
- No se documentan sesgos específicos ni evaluación de alucinación; al devolver probabilidades calibradas, el riesgo principal es una calibración deficiente fuera de la distribución de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Nimruz/Mizan-v2-4B antes de producción.
- Requiere llama.cpp b11443 o superior; versiones anteriores pueden no soportar el endpoint `/v1/systemone`.
- El rendimiento en CPU (3 s por petición de texto) limita su uso a procesos por lotes, no interactivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xmanii/Mizan-v2-4B-GGUF
- Modelo base: https://huggingface.co/Nimruz/Mizan-v2-4B
- Modelo solo texto alternativo: https://huggingface.co/Nimruz/Mizan-v3-3B
- Demo Space: https://huggingface.co/spaces/xmanii/Mizan-demo
- Colección Mizan: https://huggingface.co/collections/Nimruz/mizan-persian-decision-models-6ace723fcd8ec7e9e06d063b
- Sitio del desarrollador: https://nimruz.site
