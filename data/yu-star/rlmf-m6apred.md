# Yu-star/RLMF-m6APred

## Resumen

RLMF-m6APred es un predictor de sitios de metilación m6A en ARN publicado en Hugging Face por el usuario Yu-star (yuluo). El modelo combina un modelo de lenguaje de ARN adaptado al dominio con representaciones de secuencia artesanales (handcrafted) mediante un mecanismo de modulación y fusión guiada por el lenguaje con conexiones residuales (residual language-guided modulation and fusion, RLMF). Se distribuye como un paquete de pesos PyTorch orientado exclusivamente a inferencia sobre secuencias de ARN de 41 nucleótidos centradas.

La relevancia del modelo es de nicho: la predicción computacional de sitios m6A (N6-metiladenosina) es una tarea habitual en bioinformática de epigenética del ARN, y este paquete ofrece un conjunto de 55 checkpoints (11 conjuntos de datos × 5 folds) que cubren tejidos de humano, ratón y rata, lo que permite reproducir un protocolo de validación cruzada de cinco folds con ensemble de probabilidades.

No se trata de un modelo generativo de propósito general: es un clasificador de secuencias con etiquetas de bioinformática, sin información publicada sobre parámetros totales, longitud de contexto en tokens ni licencia final. El repositorio ocupa 0,7 GB e incluye el backbone de ARN adaptado al dominio junto con los pesos de cada fold.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de ARN adaptado al dominio con modulación y fusión residual guiada por lenguaje (RLMF); clasificador de secuencias |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en tokens; la entrada es una secuencia de ARN de 41 nt centrada |
| Tipos de cuantización | no disponible (los checkpoints se distribuyen como state dictionaries PyTorch en precisión original) |
| Idiomas soportados | no aplica (entrada de secuencias de ARN; no es un modelo de lenguaje natural) |
| Licencia | no disponible (el autor indica que se finalizará antes del lanzamiento público; aplican las licencias de los componentes preentrenados upstream) |
| Formato de pesos | PyTorch state dictionary (`.pt`), solo tensores; backbone en `pretrained/rna_language_model/` |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un híbrido entre un backbone de modelo de lenguaje de ARN adaptado al dominio (multi-especie) y un conjunto de características de secuencia calculadas a mano. La combinación se realiza mediante modulación y fusión guiada por el lenguaje con conexiones residuales (RLMF), y la salida es una clasificación binaria de sitio m6A sobre una ventana de 41 nucleótidos centrada en la posición de interés. El paquete incluye 11 conjuntos de datos (H_b, H_k, H_l para humano; M_b, M_h, M_k, M_l, M_t para ratón; R_b, R_k, R_l para rata) con 5 folds cada uno, sumando 55 checkpoints downstream.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento (no aplicables a esta tarea). Tampoco se especifica la arquitectura interna del backbone de ARN (tipo transformer, número de capas, dimensión oculta) ni el procedimiento de adaptación de dominio. Los logs de entrenamiento, estados del optimizador, particiones de datos y metadatos de búsqueda de experimentos no están incluidos en el repositorio.

## Capacidades

- Clasificación de secuencias de ARN: predice la probabilidad de que una adenosina central en una ventana de 41 nt sea un sitio m6A.
- Ensemble de cinco folds: agrega las probabilidades de los cinco checkpoints por media para la evaluación en test independiente.
- Cobertura multi-especie y multi-tejido: humano (cerebro, riñón, hígado), ratón (cerebro, corazón, riñón, hígado, testículo) y rata (cerebro, riñón, hígado).
- Normalización de entrada: acepta `U` en la secuencia de ARN y la convierte automáticamente a `T`.
- Integración de representaciones: combina embeddings del modelo de lenguaje de ARN con características de secuencia artesanales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.
- No es multilingüe en el sentido de lenguas naturales; su dominio es la secuencia de nucleótidos.

## Casos de uso

- Priorización de candidatos m6A en estudios de epitranscriptómica: dado un conjunto de regiones de ARN de 41 nt extraídas de datos de secuenciación, el modelo puntúa cada posición central y permite ordenar candidatos para validación experimental con MeRIP-seq o miCLIP.
- Análisis tejido-específico: al disponer de checkpoints por tejido (cerebro, hígado, riñón, corazón, testículo), se puede seleccionar el modelo correspondiente al tejido de origen de la muestra y comparar predicciones entre tejidos para detectar patrones diferenciales.
- Estudios comparativos entre especies: los conjuntos de humano, ratón y rata permiten aplicar el mismo pipeline a ortólogos y evaluar la conservación de la señal predictiva entre especies.
- Reproducción de resultados académicos: el repositorio incluye los 55 checkpoints y checksums SHA-256, lo que facilita la réplica del protocolo de validación de cinco folds descrito en el artículo acompañante.
- Filtrado previo en pipelines de anotación: integrado en un flujo bioinformático, el modelo reduce el espacio de búsqueda antes de análisis más costosos (motivos, estructura secundaria, conservación evolutiva).
- Docencia y experimentación metodológica: sirve como base para comparar estrategias de fusión de características (modelo de lenguaje frente a features artesanales) en tareas de clasificación de secuencias biológicas.
- Servicio web ligero: el autor publica un Space de Hugging Face que acepta una secuencia de 41 nt y devuelve la predicción del ensemble, útil para consultas puntuales sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (AUROC, AUPRC, accuracy) ni comparaciones con otros predictores de m6A, y remite al artículo acompañante, cuya cita se añadirá tras la publicación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,7 GB, por lo que un checkpoint individual y el backbone caben holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con suficiente memoria para el backbone y un checkpoint (por ejemplo, RTX 3060, RTX 4090, A100, H100); no se especifican requisitos mínimos.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del paquete (0,7 GB); no se dispone de cifras exactas de memoria en inferencia.
- Opciones de despliegue: la implementación de inferencia solo está disponible en el repositorio GitHub companion (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de clasificador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros predictores de m6A con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Las predicciones pueden verse afectadas por la especie, el tejido, el protocolo de secuenciación, la composición de motivos y el desplazamiento de distribución (distribution shift).
- Los resultados no deben interpretarse como validación experimental ni como evidencia clínica.
- La licencia no está finalizada; el uso comercial queda sujeto a la licencia que se publique y a los términos de los componentes preentrenados upstream.
- El modelo está pensado para uso en investigación, reproducción del artículo e inferencia sobre secuencias de 41 nt bajo el protocolo descrito; no se documenta su comportamiento fuera de ese régimen.
- No se incluyen logs de entrenamiento, estados del optimizador, particiones de datos ni metadatos de búsqueda de experimentos, lo que limita la auditoría del proceso de entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, sin métricas publicadas que permitan calibrarlo.
- No se especifican sesgos conocidos ni limitaciones idiomáticas (no aplica a lenguas naturales).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yu-star/RLMF-m6APred
- Space web del autor: https://huggingface.co/spaces/Yu-star/RLMF-m6APred-Web
- Repositorio GitHub companion (inferencia y evaluación): https://github.com/Yu-L1/RLMF-m6APred
- Perfil del autor en Hugging Face: https://huggingface.co/Yu-star
