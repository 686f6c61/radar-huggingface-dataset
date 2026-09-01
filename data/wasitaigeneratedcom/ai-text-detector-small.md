# wasitaigeneratedcom/ai-text-detector-small

## Resumen

`wasitaigeneratedcom/ai-text-detector-small` (tropa-mini) es un detector de texto generado por inteligencia artificial desarrollado por wasitaigenerated.com, la versión open-weights de su sistema propietario tropa-2. El modelo resuelve el problema de distinguir entre texto escrito por humanos y texto producido por LLMs como ChatGPT, Claude, Gemini o Llama, incluyendo variantes humanizadas mediante herramientas de parafraseo. Su relevancia radica en que, según los benchmarks publicados por el autor, es el detector open-weights con mejor ROC-AUC (0.968) y mayor tasa de detección a un 0.5 % de falsos positivos entre los modelos comparados.

Arquitectónicamente se basa en DeBERTa-v3-large con una cabeza de clasificación de 4 clases, cuenta con 434 millones de parámetros y un tamaño de repositorio de 1.7 GB. Está diseñado para ejecutarse en CPU sin necesidad de GPU, lo que facilita su despliegue en entornos con recursos limitados. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-large con cabeza de clasificación de 4 clases |
| Parametros totales | 434.016.260 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 768 tokens (según el código de ejemplo de la model card) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin información sobre cuantizaciones GGUF u otras) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza DeBERTa-v3-large como backbone, con una capa de clasificación lineal añadida sobre el pooling por media de los tokens (mean pooling). La cabeza clasifica en cuatro categorías: `human`, `ai`, `ai_edited` y `humanized`. El modelo es un fine-tuning de `desklib/ai-text-detector-v1.01`, aunque no se proporcionan detalles específicos sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO. La model card indica que el modelo fue evaluado en datasets públicos como Jabarian & Imas (2025), Liang et al. (2023) y un conjunto propio de textos frontier, pero no se especifica la composición exacta de los datos de entrenamiento.

## Capacidades

- Detección de texto generado por IA en bruto (ChatGPT, GPT-5, Claude, Gemini, Llama, etc.).
- Clasificación en cuatro clases: humano, IA, texto humano editado por IA (`ai_edited`) y texto IA humanizado mediante parafraseo (`humanized`).
- Proporciona una puntuación `ai_score = 1 − P(human)` en el rango [0, 1] como métrica principal.
- Funciona en CPU sin necesidad de GPU, con un tamaño de 1.7 GB.
- Soporta procesamiento de documentos largos mediante división en fragmentos de hasta 768 tokens y promediado ponderado por longitud.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador de texto.

## Casos de uso

- Moderación de contenido en plataformas editoriales: el modelo puede filtrar automáticamente artículos o publicaciones generadas por IA antes de su revisión humana, reduciendo el riesgo de contenido no autoral.
- Verificación de ensayos académicos: instituciones educativas pueden integrarlo en sus sistemas de control de plagio para detectar trabajos generados por LLMs, aunque se recomienda precaución con textos de aprendices de idiomas.
- Control de calidad en agencias de marketing: permite comprobar si los textos redactados por proveedores externos son originales o han sido generados por IA, garantizando la autenticidad del contenido entregado al cliente.
- Detección de spam y desinformación: en redes sociales o foros, el modelo puede identificar publicaciones generadas automáticamente por bots basados en LLMs, ayudando a moderar comunidades.
- Auditoría de contenido en publicaciones periódicas: medios de comunicación pueden verificar que los artículos firmados por periodistas no contengan pasajes generados por IA sin declarar, manteniendo la transparencia editorial.
- Evaluación de herramientas de humanización: empresas que desarrollan o utilizan servicios de parafraseo pueden medir la eficacia de sus herramientas comprobando si el texto resultante sigue siendo detectable como IA.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan tropa-mini con otros detectores open-weights, todos evaluados con un umbral fijado al 0.5 % de falsos positivos sobre el mismo conjunto de 6.930 documentos humanos:

| Modelo | ROC-AUC | Raw AI | Humanized AI | Frontier models |
|---|---|---|---|---|
| **tropa-mini (este modelo)** | **0.968** | **93.2 %** | **41.6 %** | **33.6 %** |
| desklib/ai-text-detector-v1.01 | 0.875 | 83.9 % | 4.0 % | 1.8 % |
| SuperAnnotate/ai-detector | 0.824 | 0.5 % | 1.4 % | 0.6 % |
| Hello-SimpleAI/chatgpt-detector-roberta | 0.571 | 0.8 % | 0.4 % | 0.2 % |
| yaful/MAGE | 0.507 | —* | —* | —* |
| roberta-large-openai-detector | 0.313 | 0.0 % | 0.1 % | 0.0 % |

*MAGE no puede alcanzar un 0.5 % de FPR en ningún umbral (marca el 26 % del texto humano web ordinario con score > 0.9999).

Además, se menciona que en el conjunto de ensayos TOEFL de Liang et al. (2023), tropa-mini marca un 15.6 % de textos de aprendices como IA en ese punto de operación, frente al 3.3 % de desklib (que a su vez detecta casi nada al mismo FPR).

## Requisitos de hardware

- Inferencia en CPU: el modelo pesa 1.7 GB y está diseñado para ejecutarse sin GPU, por lo que cabe en sistemas con 4-8 GB de RAM disponibles.
- GPU recomendada: no es necesaria; si se desea acelerar, cualquier GPU con al menos 4 GB de VRAM puede cargar el modelo en FP32, aunque no se proporcionan mediciones de latencia.
- Compatible con GPUs de consumo como RTX 3060 o superiores si se quiere acelerar la inferencia.
- Opciones de despliegue: el código de ejemplo usa la librería `transformers` de HuggingFace; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya compara este modelo con cinco alternativas open-weights. En resumen:

- **desklib/ai-text-detector-v1.01**: modelo base del que parte tropa-mini, con ROC-AUC 0.875 y mucha menor detección de texto humanizado (4.0 % vs 41.6 %).
- **SuperAnnotate/ai-detector**: ROC-AUC 0.824, pero con detección casi nula de texto IA en bruto (0.5 %).
- **Hello-SimpleAI/chatgpt-detector-roberta**: ROC-AUC 0.571, rendimiento pobre en todos los grupos.
- **yaful/MAGE**: ROC-AUC 0.507, no alcanza el umbral de FPR deseado.
- **roberta-large-openai-detector**: ROC-AUC 0.313, el peor de la comparativa.

Tropa-mini supera a todos en ROC-AUC y en detección de texto IA en bruto y humanizado, aunque su rendimiento en textos de aprendices (TOEFL) es peor que el de desklib.

## Limitaciones y advertencias

- Sesgo en textos de aprendices de idiomas: en el conjunto TOEFL de Liang et al. (2023), tropa-mini marca un 15.6 % de textos escritos por no nativos como IA, lo que puede generar falsos positivos en contextos educativos.
- Riesgo de alucinación: como clasificador, no genera texto, pero puede producir clasificaciones erróneas en textos muy cortos o con vocabulario atípico.
- Limitación de idioma: solo soporta inglés; no es aplicable a otros idiomas sin reentrenamiento.
- Umbral de decisión alto: el punto de operación recomendado (ai_score ≥ 0.976) exige una confianza muy alta para clasificar como IA, lo que reduce la sensibilidad en textos ambiguos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base (desklib/ai-text-detector-v1.01) tiene la misma licencia, por lo que no hay restricciones adicionales conocidas.
- Caveat para producción: la model card advierte que para documentos largos es necesario dividir en fragmentos y promediar, lo que puede introducir errores en los límites de los fragmentos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wasitaigeneratedcom/ai-text-detector-small
- Sitio web del desarrollador: https://www.wasitaigenerated.com/
- API de detección de IA (tropa-2): https://www.wasitaigenerated.com/ai-detector-api
- Dataset Jabarian & Imas (2025): https://github.com/brianjabarian/DetectionAI
- Dataset Liang et al. (2023): https://github.com/Weixin-Liang/ChatGPT-Detector-Bias
