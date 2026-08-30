# trinhtrantran122/gated-dual-cafebert-vinli-seed2024

## Resumen

El modelo `gated-dual-cafebert-vinli-seed2024`, desarrollado por el usuario trinhtrantran122, es un clasificador de inferencia de lenguaje natural (NLI) específico para vietnamita. Se basa en CafeBERT, una familia de modelos BERT preentrenados para este idioma, y lo modifica con una arquitectura "gated dual" que combina dos ramas de representación mediante una compuerta aprendida. Además incorpora técnicas de regularización como multi-sample dropout y suavizado de parámetros mediante media exponencial (parameter EMA). El modelo está entrenado y evaluado sobre el conjunto de datos VINLI, alcanzando una F1 macro de 0,8278 y una precisión de 0,8277 en el conjunto de test. Su relevancia radica en ofrecer un punto de partida sólido para tareas de NLI en vietnamita, un idioma con menos recursos que el inglés, y en explorar arquitecturas ligeras pero efectivas sobre un backbone preentrenado. El repositorio tiene un tamaño de 4,5 GB, lo que sugiere un modelo de gran tamaño, aunque no se especifica el número exacto de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CafeBERT con variante "gated dual" (dos ramas con compuerta) |
| Parámetros totales | no disponible (tamaño del repo: 4,5 GB) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch, según los tags) |

## Arquitectura y entrenamiento

La arquitectura parte de CafeBERT, un modelo transformer basado en BERT preentrenado con corpus vietnamita. La variante "gated dual" introduce dos ramas de codificación que procesan la misma entrada de forma paralela (posiblemente con diferentes inicializaciones o capas de atención) y combinan sus salidas mediante una compuerta aprendida que pondera la contribución de cada rama. Esta técnica busca capturar representaciones complementarias y mejorar la robustez. El entrenamiento utiliza multi-sample dropout, que aplica varias máscaras de dropout durante la inferencia para promediar las predicciones, y parameter EMA, que mantiene una media móvil de los pesos del modelo para estabilizar el entrenamiento y mejorar la generalización. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset (más allá de VINLI) ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO.

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) en vietnamita: determina si una hipótesis es consecuencia, contradicción o neutral respecto a una premisa.
- Procesamiento de pares de frases en vietnamita, con salida de tres clases (entailment, contradiction, neutral).
- Capacidad de razonamiento textual a nivel de relación semántica entre dos oraciones.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Limitado al idioma vietnamita; no se han reportado capacidades multilingües.

## Casos de uso

- Verificación de hechos en vietnamita: dado un titular y un artículo, el modelo puede clasificar si el titular es apoyado, contradicho o neutral respecto al contenido del artículo, útil para plataformas de fact-checking.
- Sistemas de respuesta a preguntas basadas en documentos: al comparar una pregunta con pasajes candidatos, el modelo puede filtrar pasajes que son contradictorios o irrelevantes, mejorando la precisión de la recuperación.
- Moderación de contenido: en foros o redes sociales, se puede usar para detectar si una respuesta contradice una norma o política dada, ayudando a identificar contenido problemático.
- Evaluación de consistencia en diálogos: en sistemas conversacionales, el modelo puede verificar si la respuesta de un agente es coherente con las afirmaciones anteriores del usuario.
- Análisis de contratos o documentos legales: comparar cláusulas para detectar contradicciones o acuerdos, facilitando la revisión automática de textos largos.
- Clasificación de pares de noticias: para agregadores de noticias, puede determinar si dos artículos tratan el mismo tema de manera consistente o si se contradicen, ayudando a detectar desinformación.

## Benchmarks y rendimiento

Según la model card, el modelo alcanza los siguientes resultados en el conjunto de test de VINLI:

| Métrica | Valor |
|---|---|
| F1 macro | 0,8278 |
| Accuracy | 0,8277 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio (4,5 GB) sugiere un modelo de gran tamaño. Si se trata de CafeBERT large (alrededor de 340 millones de parámetros) en precisión fp32, la VRAM necesaria para inferencia sería aproximadamente 1,4 GB por peso (con overhead, unos 2-3 GB). Con cuantización a 8 bits, se reduciría a unos 0,5-0,7 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 o superiores.
- Si fuera CafeBERT base (110 millones de parámetros), la VRAM estimada sería menor (menos de 1 GB en fp32), ejecutable en cualquier GPU moderna o incluso CPU.
- No se especifican GPUs recomendadas ni opciones de despliegue. Dado que es un modelo PyTorch, puede cargarse con transformers y servirse con vLLM, TGI o simplemente en un script de inferencia.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (NLI vietnamita) dentro de los datos proporcionados. Existe una variante del mismo autor, `gated-dual-cafebert-vinli-sota`, que probablemente tenga arquitectura similar, pero no se detallan sus resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o distribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- El modelo está entrenado únicamente para vietnamita; no soporta otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo basado en BERT preentrenado con corpus web, puede heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones incorrectas en casos ambiguos o con vocabulario técnico poco representado.
- No se proporciona información sobre el contexto máximo soportado, lo que limita su uso en documentos largos sin truncamiento previo.
- El repositorio no incluye ejemplos de uso ni documentación adicional, lo que dificulta la integración rápida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trinhtrantran122/gated-dual-cafebert-vinli-seed2024
- Variante SOTA del mismo autor: https://huggingface.co/trinhtrantran122/gated-dual-cafebert-vinli-sota
