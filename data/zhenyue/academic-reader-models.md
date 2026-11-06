# zhenyue/academic-reader-models

## Resumen

`zhenyue/academic-reader-models` no es un modelo de lenguaje único, sino un repositorio de artefactos empaquetados que la aplicación Academic Reader descarga en tiempo de ejecución. El repositorio agrupa cuatro componentes heterogéneos: un modelo de layout documental D-FINE convertido a Core ML (bajo licencia OXR-1.0), el modelo de embeddings `BAAI/bge-small-en-v1.5` también convertido a Core ML, un conjunto de fuentes tipográficas Source Han Serif/Sans CN de Adobe, y un espejo en formato safetensors del modelo `SoMarkAI/OXR-1.0` (disponible solo en ModelScope). El autor del repositorio es el usuario `zhenyue`, y el paquete está pensado para verificar la integridad de cada fichero mediante su hash SHA-256 dentro de la propia aplicación.

El interés técnico del repositorio radica en su naturaleza de distribución empaquetada para una app de lectura académica: combina un detector de layout (D-FINE), un encoder de recuperación semántica (bge-small-en-v1.5) y un modelo de OCR/documento (OXR-1.0) en un único bundle de 0,2 GB. La conversión a Core ML con precisión mixta apunta a ejecución en Apple Silicon (CPU/GPU/Neural Engine), lo que sugiere un despliegue local en macOS o iOS.

No se dispone de información sobre arquitectura interna del modelo OXR-1.0, número de parámetros, longitud de contexto ni datos de entrenamiento más allá de lo indicado en la model card. La ficha se limita, por tanto, a documentar lo que el autor declara explícitamente y a marcar como "no disponible" todo aquello que no se especifica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio agrupa D-FINE layout, bge-small-en-v1.5 y OXR-1.0; arquitecturas individuales no detalladas) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Core ML con precisión mixta (D-FINE y bge-small-en-v1.5); safetensors sin cuantización declarada para OXR-1.0 |
| Idiomas soportados | No disponible (bge-small-en-v1.5 es un modelo en inglés; el resto sin especificar) |
| Licencia | Mixta: OXR License (Apache-2.0 con términos adicionales de SoMark) para D-FINE y OXR-1.0; MIT para bge-small-en-v1.5; SIL Open Font License 1.1 para las fuentes |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`) y safetensors (`model.safetensors` + `tokenizer.json`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: empaqueta artefactos de terceros y un modelo propio de SoMarkAI (OXR-1.0). El componente D-FINE es un detector de objetos orientado a layout documental, convertido a Core ML en precisión mixta; D-FINE es una familia de detectores basada en transformers con refinamiento de bordes, aunque la model card no detalla la variante concreta ni el número de parámetros. El componente `bge-small-en-v1.5` es un encoder de frases de BAAI, conocido por su uso en recuperación semántica y búsqueda vectorial, aquí también convertido a Core ML; su tamaño habitual ronda los 33 millones de parámetros, dato que la model card no confirma explícitamente para esta conversión.

El componente OXR-1.0 (SoMarkAI) se distribuye como espejo en safetensors y se describe como el modelo principal del paquete, pero la model card no aporta información sobre su arquitectura, número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. Todo ello queda marcado como no disponible.

## Capacidades

- Detección de layout documental: el componente D-FINE identifica regiones (texto, figuras, tablas, encabezados) en páginas de documentos académicos.
- Recuperación semántica y embeddings: `bge-small-en-v1.5` genera representaciones vectoriales para búsqueda por similitud sobre texto en inglés.
- Procesamiento de documentos académicos: OXR-1.0 se presenta como modelo del pipeline de lectura académica, aunque sus capacidades concretas no se detallan.
- Ejecución local en Apple Silicon: la conversión a Core ML con precisión mixta permite inferencia en CPU, GPU y Neural Engine de dispositivos Apple.
- Verificación de integridad: cada artefacto se valida contra su SHA-256 en la aplicación, lo que aporta garantías de cadena de suministro.
- Soporte tipográfico multilingüe (chino simplificado y tradicional, japonés, coreano) mediante las fuentes Source Han incluidas.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes ni multimodalidad más allá del layout.

## Casos de uso

- Extracción de estructura en artículos académicos: D-FINE detecta bloques de texto, figuras y tablas en PDFs escaneados, permitiendo reconstruir el orden de lectura antes de aplicar OCR o extracción de texto.
- Búsqueda semántica en una biblioteca personal de papers: `bge-small-en-v1.5` indexa fragmentos y permite consultas por similitud vectorial sin salir del dispositivo, útil para investigadores con grandes colecciones locales.
- Lectura offline en macOS/iOS: al estar convertidos a Core ML, los modelos se ejecutan en el Neural Engine sin necesidad de conexión ni de enviar documentos a la nube, lo que reduce riesgos de privacidad.
- Preprocesado para pipelines de RAG académico: el layout detector segmenta el documento y el encoder genera embeddings que alimentan un índice vectorial local para un asistente de lectura.
- Distribución verificable de artefactos ML: el patrón de hashes SHA-256 sirve como referencia para empaquetar modelos en aplicaciones de escritorio con garantías de integridad.
- Renderizado de documentos CJK: las fuentes Source Han permiten mostrar correctamente texto en chino, japonés y coreano en la interfaz de lectura.
- Prototipado de OCR documental en Apple Silicon: el espejo de OXR-1.0 en safetensors permite experimentar con el modelo fuera del bundle Core ML, aunque requiere infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 0,2 GB, por lo que el conjunto de artefactos cabe holgadamente en memoria de cualquier dispositivo moderno; el desglose por componente no se detalla.
- GPU recomendadas: no se especifican; el formato Core ML está orientado a Apple Silicon (M1/M2/M3/M4) con aceleración por Neural Engine y GPU integrada.
- Compatibilidad con GPU de consumo: los artefactos Core ML no están pensados para GPUs NVIDIA; el espejo safetensors de OXR-1.0 podría ejecutarse en GPUs de consumo, pero se desconoce su tamaño y por tanto los requisitos reales.
- Opciones de despliegue: Core ML (Core ML Tools, Xcode) para los componentes convertidos; safetensors requiere un runtime compatible (PyTorch, Transformers) para OXR-1.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zhenyue/academic-reader-models` | Bundle (layout + embeddings + OCR) | No disponible | No disponible | Mixta (OXR, MIT, OFL) | Hugging Face (0 descargas) |
| `BAAI/bge-small-en-v1.5` | Encoder de embeddings | ~33 M (no confirmado en esta conversión) | 512 tokens (típico de la familia) | MIT | Hugging Face, ampliamente usado |
| D-FINE (upstream) | Detector de objetos | No disponible en esta ficha | No aplica | Apache-2.0 (upstream) | GitHub, Hugging Face |
| `SoMarkAI/OXR-1.0` | Modelo de documento | No disponible | No disponible | OXR License | ModelScope (espejo en este repo) |

La comparativa directa es limitada porque el repositorio no es un modelo único sino un paquete de distribución. Frente a alternativas como `docling` o `unstructured`, que ofrecen pipelines de layout y OCR en Python, este bundle se distingue por su orientación a ejecución local en Apple Silicon y por la verificación criptográfica de artefactos.

## Limitaciones y advertencias

- La model card no documenta arquitectura, parámetros, contexto ni datos de entrenamiento de OXR-1.0, lo que impide evaluar su calidad de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por la comunidad.
- La licencia es mixta y la OXR License incluye términos adicionales sobre Apache-2.0 que no se detallan en la model card; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- `bge-small-en-v1.5` está entrenado principalmente en inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Las conversiones a Core ML con precisión mixta pueden introducir degradaciones numéricas respecto a los pesos originales; no se publican métricas de fidelidad de la conversión.
- Riesgo de alucinación y sesgos: no evaluable sin información sobre el entrenamiento de OXR-1.0.
- El espejo de OXR-1.0 solo está disponible en ModelScope según la model card, lo que puede complicar la reproducibilidad fuera de ese ecosistema.
- No se especifican requisitos de versión mínima de macOS/iOS ni de Core ML Tools para cargar los artefactos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhenyue/academic-reader-models
- Modelo upstream de embeddings: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio D-FINE (upstream, referencia): https://github.com/Peterande/D-FINE
- Modelo OXR-1.0 en ModelScope: no disponible (la model card lo menciona sin enlace directo)
- Fuentes Source Han de Adobe: https://github.com/adobe-fonts/source-han-serif y https://github.com/adobe-fonts/source-han-sans
