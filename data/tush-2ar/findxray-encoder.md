# tush-2ar/findxray-encoder

## Resumen

FindXRay encoder es un codificador de imágenes de radiografías de tórax derivado de microsoft/rad-dino, un modelo de visión especializado en imagen médica. Lo desarrolla tush-2ar como componente del proyecto FindXRay, una aplicación que busca radiografías de tórax históricas similares a una imagen de consulta y que se ejecuta íntegramente en el navegador del visitante mediante ONNX Runtime Web.

El modelo original RAD-DINO es un ViT de 768 dimensiones de embedding entrenado con pares imagen-texto de radiología. Esta versión no reentrena los pesos: los exporta a ONNX y los comprime con cuantización dinámica int8, reduciendo el artefacto de 330 MB a 86 MB, un tamaño viable para descarga en cliente. La salida es un embedding CLS de 768 dimensiones, normalizado L2, pensado para búsqueda por similitud coseno.

Su relevancia es acotada pero concreta: demuestra que un codificador médico de propósito general puede comprimirse a int8 con pérdida de calidad mínima (coseno 0,996 frente al modelo en precisión completa) y desplegarse en el navegador sin backend. No es un modelo diagnóstico ni un producto clínico; es una pieza de infraestructura de recuperación de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) derivado de microsoft/rad-dino, exportado a ONNX |
| Parámetros totales | no disponible (el artefacto int8 ocupa 86 MB; el original en precisión completa, 330 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 224×224 píxeles) |
| Tipos de cuantización | int8 dinámica de ONNX Runtime |
| Idiomas soportados | no disponible (modelo de visión; sin interfaz de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (modelo cuantizado int8) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de microsoft/rad-dino: un transformer de visión que procesa la imagen como una secuencia de parches y produce una representación global. Esta ficha no dispone de datos sobre el número exacto de capas, dimensión oculta o cabezas de atención del modelo original; lo único confirmado es la dimensión del embedding de salida (768) y el tamaño de entrada (224×224). El autor no ha reentrenado ni ajustado los pesos: el trabajo consiste en la exportación a ONNX y la cuantización dinámica int8 de las matrices de pesos.

El preprocesado está documentado con precisión: la imagen en escala de grises se redimensiona por el lado corto a 518 píxeles, se reduce a 224 con interpolación bicúbica, se recorta al centro a 224×224, se escala a [0, 1], se normaliza con media 0,5307 y desviación típica 0,2583, y se replica en tres canales. La salida es el embedding CLS normalizado L2. El autor reporta una similitud coseno de 0,996 frente al modelo en precisión completa y una precisión de recuperación en el conjunto IU X-ray sin cambios (P@5 = 0,417). No se documentan detalles sobre los datos de entrenamiento originales de RAD-DINO ni sobre si hubo ajuste fino con pares imagen-texto en esta derivada.

## Capacidades

- Extracción de características de radiografías de tórax: genera un vector de 768 dimensiones por imagen, adecuado para búsqueda por similitud.
- Recuperación de imágenes por contenido: permite construir índices vectoriales de estudios previos y consultarlos con una nueva radiografía.
- Ejecución en navegador: el formato ONNX int8 y el tamaño de 86 MB permiten inferencia en cliente con ONNX Runtime Web, sin enviar datos de pacientes a un servidor.
- Preprocesado determinista y documentado: la normalización y el redimensionado están especificados, lo que facilita reproducir los embeddings en otros entornos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno: es un codificador de imágenes, no un modelo generativo.
- No procesa texto ni audio; no tiene capacidades multilingües en el sentido habitual.
- No genera informes ni etiquetas diagnósticas: solo produce representaciones vectoriales.

## Casos de uso

- Búsqueda de estudios previos similares en un visor web: el codificador se carga en el navegador, se calcula el embedding de la radiografía consultada y se compara por similitud coseno contra un índice de embeddings precalculados. El tamaño int8 y la licencia MIT lo hacen viable para una demo pública sin backend.
- Prototipos de investigación en recuperación de imágenes médicas: sirve para evaluar pipelines de búsqueda visual sobre IU X-ray u otros conjuntos con radiografías de tórax, con la ventaja de que el artefacto es pequeño y reproducible.
- Educación y demostraciones de privacidad: al ejecutarse en cliente, permite mostrar técnicas de análisis de imagen médica sin transferir datos identificables a un servidor, un argumento relevante en entornos docentes.
- Indexación offline de archivos de radiografías: el modelo puede ejecutarse en lote con ONNX Runtime para generar embeddings de un archivo histórico y construir un índice vectorial (FAISS, hnswlib) para consultas posteriores.
- Componente de sistemas de etiquetado asistido: los embeddings pueden alimentar un clasificador ligero o un modelo de recuperación aumentada que proponga casos similares a un radiólogo, siempre como herramienta de apoyo y no de diagnóstico.
- Integración en aplicaciones de escritorio o móviles con ONNX Runtime: al no depender de PyTorch, el mismo artefacto puede desplegarse en plataformas con recursos limitados, incluidos entornos sin GPU.
- Comparación de técnicas de cuantización: útil como caso de estudio de cuánto degrada int8 dinámica a un codificador médico, con una métrica concreta de referencia (coseno 0,996).

## Benchmarks y rendimiento

| Métrica | Resultado reportado |
|---|---|
| Similitud coseno frente al modelo en precisión completa | 0,996 |
| Precisión de recuperación en IU X-ray (P@5) | 0,417 (sin cambios respecto al modelo completo) |
| Tamaño del artefacto | 86 MB (int8) frente a 330 MB (precisión completa) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un codificador de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el artefacto int8 de 86 MB sugiere un consumo bajo, del orden de cientos de MB incluyendo activaciones para una entrada de 224×224, pero el autor no publica cifras.
- GPU recomendadas: no disponibles; el diseño apunta a ejecución en CPU mediante ONNX Runtime Web en el navegador.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, cabría en cualquier GPU con al menos 1 GB de memoria libre, pero no hay mediciones publicadas.
- Opciones de despliegue: ONNX Runtime (incluida la variante Web), y por el formato del artefacto, cualquier runtime compatible con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor no publica tiempos de inferencia en navegador ni en servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FindXRay encoder (esta ficha) | no disponible (86 MB int8) | imagen 224×224 | ONNX int8 | MIT | HuggingFace, 0 descargas |
| microsoft/rad-dino | no disponible (330 MB en precisión completa) | imagen 224×224 | safetensors (PyTorch) | MIT | HuggingFace, modelo base |
| Otros codificadores de radiología (p. ej. variantes de BiomedCLIP) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El único contraste documentado es con su modelo base, del que se diferencia por el formato (ONNX int8 frente a PyTorch) y por el tamaño del artefacto, manteniendo la licencia MIT.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo declara explícitamente como demo de investigación y no apto para diagnóstico.
- Dominio restringido: entrenado para radiografías de tórax; no se ha validado en otras modalidades de imagen médica ni en fotografías naturales.
- Riesgo de sesgo: al heredar los datos de entrenamiento de RAD-DINO, puede reproducir sesgos de población, equipo o protocolo de adquisición presentes en el corpus original; no se documenta ninguna evaluación de equidad.
- Riesgo de falsos positivos en recuperación: una similitud coseno alta no implica similitud clínica; el sistema devuelve vecinos geométricamente próximos en el espacio de embeddings, no casos necesariamente relevantes para el diagnóstico.
- Dependencia del preprocesado: cambiar el redimensionado, la normalización o el recorte altera los embeddings y degrada la recuperación; el pipeline debe replicarse exactamente.
- Sin datos de contexto, idiomas ni generación: no puede producir texto, responder preguntas ni procesar informes clínicos.
- Licencia MIT: permite uso comercial y modificación, pero no exime de las obligaciones regulatorias aplicables a software sanitario ni de la responsabilidad sobre los datos de pacientes.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni mantenimiento documentado.
- Fecha de creación registrada en 2026-10-28, posterior a la mayoría de los artefactos del ecosistema; conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tush-2ar/findxray-encoder
- Modelo base: https://huggingface.co/microsoft/rad-dino
- Repositorio del proyecto FindXRay: https://github.com/tusharbansalwork/FindXRay
