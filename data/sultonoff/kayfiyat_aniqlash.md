# SultonOFF/Kayfiyat_aniqlash

## Resumen

Kayfiyat_aniqlash es un clasificador de sentimiento en tres clases (positivo, negativo y neutro) para uzbeko, desarrollado por el usuario SultonOFF. Se trata de un fine-tuning de `FacebookAI/xlm-roberta-base`, el encoder multilingüe de RoBERTa publicado por Facebook AI, adaptado específicamente al dominio del "día a día universitario" mediante un conjunto de datos muy reducido de frases escritas a mano.

El modelo resuelve una tarea concreta: asignar una etiqueta de polaridad a una frase corta en uzbeko. No es un modelo generativo ni un asistente conversacional; es un clasificador de secuencia con una cabeza de tres clases sobre el encoder XLM-R. Su relevancia es limitada y fundamentalmente didáctica: el propio autor lo declara como material de aprendizaje, con un conjunto de evaluación de solo 30 frases y una precisión reportada de 0,83.

Con 278 millones de parámetros (el tamaño estándar de XLM-R base) y un repositorio de 1,1 GB en formato safetensors, el modelo es ligero y desplegable en hardware modesto, pero su utilidad en producción es dudosa por el tamaño y la composición del dataset de entrenamiento. La licencia MIT facilita su reutilización, aunque la calidad del artefacto debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de 3 clases |
| Parametros totales | 278.045.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base XLM-R admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion dinamica via PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa base: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado de forma multilingüe sobre corpus en 100 idiomas. Sobre ese encoder, el autor ha añadido una cabeza de clasificación lineal con tres salidas (positivo, negativo, neutro), sustituyendo la cabeza original de modelado de lenguaje enmascarado. No se documenta ninguna innovación arquitectónica adicional.

El entrenamiento consiste en un fine-tuning supervisado sobre un conjunto de 150 frases en uzbeko escritas a mano, con 50 ejemplos por clase. No se menciona el uso de RLHF, DPO ni técnicas de aumento de datos. El conjunto de evaluación consta de 30 frases, sobre las que se reporta una precisión de 0,83. No se especifican hiperparámetros, número de épocas, tasa de aprendizaje ni estrategia de validación. El modelo base fue publicado por Facebook AI; el fine-tuning y la model card son obra de SultonOFF.

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, negativo, neutro) para frases cortas en uzbeko.
- Especialización en el dominio del "día a día universitario", según declara el autor.
- Entrada de texto de longitud limitada por la ventana del encoder (hasta 512 tokens en XLM-R base, aunque no se documenta el truncamiento aplicado).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües efectivas: aunque el encoder base es multilingüe, el fine-tuning se ha realizado solo en uzbeko y la etiqueta de idioma del repositorio es exclusivamente `uz`.
- No dispone de modo "thinking", visión, audio ni generación de texto libre.

## Casos de uso

- Análisis de opiniones en encuestas universitarias: el modelo puede etiquetar respuestas abiertas cortas de estudiantes como positivas, negativas o neutras, siempre que el texto esté en uzbeko y el dominio coincida con el de entrenamiento. Es adecuado solo como prototipo por el reducido tamaño del dataset.
- Filtrado preliminar de comentarios en foros o canales de estudiantes: permite separar rápidamente mensajes negativos para revisión humana, usando la clase negativa como señal de escalado. La baja cobertura del entrenamiento limita su fiabilidad.
- Etiquetado asistido para construir datasets: el modelo puede preanotar frases en uzbeko que luego un humano corrige, acelerando la creación de corpus de sentimiento más grandes. Es un uso realista dado el carácter didáctico del artefacto.
- Demostración educativa de fine-tuning de XLM-R: sirve como ejemplo reproducible de cómo adaptar un encoder multilingüe a una tarea de clasificación con pocos datos, incluyendo la discusión de sus limitaciones.
- Monitorización de satisfacción en servicios universitarios: con un volumen bajo de textos cortos y homogéneos, puede generar métricas agregadas de polaridad por periodo, aceptando un margen de error alto.
- Pruebas de concepto en pipelines de NLP en uzbeko: integrable como componente de clasificación en un flujo mayor (por ejemplo, junto a un modelo generativo que redacte respuestas), siempre con validación humana y sin uso en decisiones automatizadas de alto impacto.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Precision (accuracy) | 0,83 | 30 frases en uzbeko, escritas a mano |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes de clasificación) en la información disponible. El único dato reportado por el autor es la precisión sobre un conjunto de evaluación propio de 30 frases, sin desglose por clase ni matriz de confusión.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos, más overhead de activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16: alrededor de 0,6 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es más que suficiente. También funciona en CPU para volúmenes moderados.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y prácticamente cualquier modelo con 4 GB o más.
- Opciones de despliegue: `transformers` con PyTorch, exportación a ONNX Runtime, TorchScript o cuantización dinámica de PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU moderna y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kayfiyat_aniqlash (este modelo) | 278 M | no disponible (base: 512) | Clasificacion de sentimiento en uzbeko, 3 clases | MIT | HuggingFace |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingue (MLM) | MIT | HuggingFace |
| CardiffNLP/twitter-xlm-roberta-base-sentiment | ~278 M | 512 tokens | Sentimiento multilingue, 3 clases | no disponible en esta ficha | HuggingFace |

La comparación con alternativas específicas para uzbeko no está disponible en la información proporcionada. El modelo base XLM-R y los fine-tunings multilingües de sentimiento son los referentes naturales, pero no se dispone de sus métricas en uzbeko para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 150 frases en total, 50 por clase. La capacidad de generalización es muy limitada.
- Conjunto de evaluación mínimo: solo 30 frases, lo que hace que la precisión de 0,83 tenga un intervalo de confianza muy amplio y poca significación estadística.
- El autor reconoce errores en texto en cirílico, en ironía y en negaciones complejas.
- La frontera de la clase neutra es ambigua según el propio autor, lo que puede producir etiquetas inconsistentes.
- El modelo está restringido al dominio del "día a día universitario"; su rendimiento fuera de ese contexto es desconocido y probablemente degradado.
- Aunque la licencia MIT permite uso comercial, la calidad del modelo no lo hace recomendable para decisiones automatizadas sin supervisión humana.
- Riesgo de sesgo derivado de la composición manual del dataset: 150 frases escritas por una sola persona no representan la variación dialectal, registral ni sociolingüística del uzbeko.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas con alta confianza.
- El autor lo declara explícitamente como material "solo para fines de aprendizaje"; no debe tratarse como un componente listo para producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SultonOFF/Kayfiyat_aniqlash
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-R (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
- Paper de RoBERTa (Liu et al., 2019): https://arxiv.org/abs/1907.11692
