# Wizzas/SumProof

## Resumen

SumProof no es un modelo de lenguaje en sentido estricto, sino un repositorio de código fuente publicado en Hugging Face bajo el identificador `Wizzas/SumProof`. El autor, Wizzas, lo distribuye también en GitHub (github.com/WAYTECHG/SumProof) y lo presenta como un proyecto de cartera ("portfolio") que implementa dos aplicaciones sobre modelos abiertos de terceros: extracción estructurada de datos de tickets de compra con verificación aritmética, y búsqueda de evidencia sobre presentaciones reales ante la SEC (SEC filings) mediante recuperación aumentada (RAG).

El sistema se apoya en tres modelos preentrenados de la familia Qwen: Qwen3.5-4B (visión-lenguaje, febrero de 2026), Qwen3-Embedding-0.6B y Qwen3-Reranker-0.6B. Sobre el primero se aplica un ajuste fino con QLoRA (adaptador de 0,67 % de los pesos) entrenado en una única GPU de portátil de 8 GB. El repositorio de Hugging Face tiene un tamaño de 0,0 GB, cero descargas y cero "likes" en el momento de la consulta, lo que sugiere que se trata de una publicación reciente y de escasa difusión.

La relevancia del proyecto es metodológica más que de modelo: documenta con métricas concretas cómo un ajuste fino ligero y un verificador aritmético elevan el F1 de campos de 0,79 a 0,94 y los tickets completamente correctos de 6 a 62 sobre 100, y cómo el enrutamiento por empresa y año más el reranking suben el Recall@5 de 0,53 a 0,71 en un corpus de 12.013 páginas de 84 documentos de FinanceBench. No se dispone de información sobre la licencia del código ni sobre los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo propio: pipeline sobre Qwen3.5-4B (visión-lenguaje), Qwen3-Embedding-0.6B y Qwen3-Reranker-0.6B; ajuste fino QLoRA sobre el modelo base |
| Parametros totales | No disponible (el adaptador LoRA representa el 0,67 % de los pesos del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 4 bits NF4 (bitsandbytes) durante el entrenamiento QLoRA; no se detallan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene código fuente, no pesos; tamaño del repo: 0,0 GB) |

## Arquitectura y entrenamiento

El repositorio describe dos subsistemas. El primero, el lector de tickets (`sumproof/receipts/`), pasa la fotografía directamente a Qwen3.5-4B, cuyo codificador visual la convierte en hasta unos 800 tokens de imagen y cuyo modelo de lenguaje emite el ticket en JSON, sin paso OCR separado. Además de la lectura voraz, se muestrean cuatro lecturas adicionales (cinco candidatos en total) y un verificador aritmético conserva la que satisface más reglas: que los ítems sumen el subtotal, que subtotal + impuesto − descuento = total y que efectivo − cambio = total. Si ni siquiera la mejor candidata cumple, el ticket se deriva a revisión humana. El ajuste fino se realizó con QLoRA sobre 800 tickets reales del conjunto CORD, con el modelo base de 4 bits congelado y un adaptador LoRA del 0,67 % de los pesos que se acopla al modelo de lenguaje en inferencia.

El segundo subsistema (`sumproof/rag/`) indexa 84 presentaciones de la SEC en 12.013 páginas, cada una embebida con Qwen3-Embedding en un vector de 1024 dimensiones. Ante una consulta, un enrutador por empresa (nombre, ticker o alias) y año fiscal selecciona los documentos candidatos; después se hace búsqueda vectorial exacta en FAISS o en PostgreSQL con pgvector (donde el enrutamiento es una cláusula `WHERE` de SQL), y finalmente Qwen3-Reranker puntúa la pregunta contra cada página. La generación de respuesta la realiza Qwen3.5-4B con cita de la página recuperada. El proyecto incluye además una interfaz en Next.js, TypeScript, React y Tailwind, y despliegue en Vercel.

## Capacidades

- Extracción estructurada de tickets de compra a JSON a partir de imagen, con codificador visual integrado (sin OCR externo).
- Verificación aritmética automática de la coherencia numérica de la extracción y derivación a revisión humana cuando falla.
- Muestreo múltiple (5 candidatos) y selección por reglas de consistencia.
- Búsqueda semántica sobre documentos financieros con embeddings de 1024 dimensiones.
- Enrutamiento por metadatos (empresa y año fiscal) combinado con búsqueda vectorial.
- Reranking de páginas candidatas para mejorar la precisión del contexto recuperado.
- Generación de respuestas RAG con cita de la página de evidencia.
- Almacenamiento vectorial intercambiable entre FAISS y PostgreSQL + pgvector, verificado con resultados idénticos.
- Filtrado de páginas por confianza del reranker para reducir tokens de prompt.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de gastos de empresa: el pipeline lee la foto del ticket, extrae los campos a JSON y valida que los importes cuadren, derivando a revisión humana solo los casos incoherentes; encaja en flujos de reembolso donde la exactitud numérica es crítica.
- Auditoría de tickets en aplicaciones móviles: al muestrear cinco lecturas y conservar la aritméticamente consistente, reduce errores de extracción en capturas de baja calidad sin necesidad de OCR dedicado.
- Búsqueda de evidencia en informes financieros: dado un corpus de presentaciones SEC, el enrutador por empresa y año más el reranking permiten localizar la página que respalda una afirmación con un Recall@5 de 0,71.
- Asistentes de análisis financiero con RAG: la generación con cita permite responder preguntas sobre documentos regulados indicando la página fuente, lo que facilita la verificación por parte del analista.
- Despliegue en hardware modesto: todo el sistema, incluido el ajuste fino, se ejecuta en una GPU de portátil de 8 GB, lo que lo hace viable para prototipos y equipos sin infraestructura dedicada.
- Sustitución de almacén vectorial: la paridad verificada entre FAISS y pgvector permite migrar de un índice local a una base de datos relacional con filtros SQL sin cambiar los resultados.
- Optimización de coste de inferencia: el filtrado de páginas por confianza del reranker recorta un 28 % los tokens de prompt sin cambio estadísticamente significativo en exactitud, útil en despliegues con facturación por token.

## Benchmarks y rendimiento

| Metrica | Antes | Despues |
|---|---|---|
| F1 de campos en tickets (extraccion) | 0,79 | 0,94 |
| Tickets completamente correctos (de 100) | 6 | 62 |
| Recall@5 en busqueda financiera | 0,53 | 0,71 |
| Respuestas correctas con RAG (150 preguntas) | 8 % | 35 % |
| Reduccion de tokens de prompt por filtrado de reranker | — | 28 % (sin cambio significativo de exactitud) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU de 8 GB de VRAM suficiente para el ajuste fino QLoRA del modelo de 4B en 4 bits NF4, según el autor (una GPU de portátil de 8 GB).
- Para inferencia, el modelo base de 4B en 4 bits requiere del orden de 3-4 GB de VRAM, aunque esta cifra no la proporciona el autor y es una estimación a partir del tamaño del modelo.
- Los modelos de embedding y reranking de 0,6B añaden una carga adicional modesta, no cuantificada en la documentación.
- No se especifican GPU recomendadas (A100, H100, RTX 4090) ni latencia o throughput medidos.
- Opciones de despliegue mencionadas: PyTorch, Hugging Face Transformers, PEFT, bitsandbytes, Sentence Transformers y TensorBoard; no se citan vLLM, llama.cpp, Ollama ni TGI.
- Interfaz web desplegable en Vercel (Next.js), independiente de la GPU de inferencia.

## Comparativa con modelos similares

| Proyecto | Enfoque | Modelo base | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SumProof | Extraccion de tickets con verificacion aritmetica + RAG sobre SEC filings | Qwen3.5-4B, Qwen3-Embedding-0.6B, Qwen3-Reranker-0.6B | GPU de 8 GB | No disponible | Codigo en Hugging Face y GitHub; sin pesos propios |
| Donut (Naver) | Extraccion de documentos de imagen a JSON | Propio (Swin + BART) | GPU variable | MIT | Pesos publicos |
| LayoutLMv3 (Microsoft) | Comprension de documentos con layout | Propio | GPU variable | Licencia de investigacion | Pesos publicos |
| Pipeline OCR + LLM generico | OCR (Tesseract/PaddleOCR) + LLM para estructuracion | Variable | CPU/GPU | Segun componentes | Amplia |

La comparación es aproximada: SumProof no publica pesos propios y su valor diferencial es el verificador aritmético y el enrutamiento por metadatos, no un modelo entrenado desde cero. No se dispone de datos de rendimiento de los proyectos alternativos en la información proporcionada para una comparación numérica directa.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo (tamaño 0,0 GB); es código fuente, por lo que no puede usarse como modelo directamente.
- Licencia no especificada: no se puede asumir uso comercial sin consultar el repositorio de GitHub del autor.
- Idiomas soportados no documentados; el pipeline está orientado a tickets y documentos en inglés (CORD, FinanceBench, SEC filings).
- El verificador aritmético solo detecta incoherencias numéricas; no valida la semántica de los campos extraídos (por ejemplo, un comercio mal identificado con importes coherentes pasaría).
- Los resultados de extracción (F1 0,94) proceden de 800 tickets de CORD y 100 de evaluación; no hay evidencia de generalización a otros formatos o países.
- Los resultados de RAG (35 % de respuestas correctas) siguen siendo bajos para uso autónomo en producción; el sistema está pensado para asistir a un analista, no para sustituirlo.
- El enrutamiento por empresa y año fiscal depende de que la consulta mencione explícitamente esos metadatos; consultas ambiguas pueden seleccionar documentos incorrectos.
- Riesgo de alucinación inherente al modelo generativo Qwen3.5-4B, mitigado solo parcialmente por la cita de página.
- No hay datos de sesgos, latencia, throughput ni comportamiento multilingüe.
- Proyecto de cartera con cero descargas y cero "likes": sin comunidad ni mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/Wizzas/SumProof
- GitHub: https://github.com/WAYTECHG/SumProof
- Dataset CORD (referenciado para el ajuste fino): no disponible en la información proporcionada
- FinanceBench (referenciado para la evaluación RAG): no disponible en la información proporcionada
- Qwen3.5-4B, Qwen3-Embedding-0.6B y Qwen3-Reranker-0.6B: no se proporcionan enlaces directos en la información disponible
