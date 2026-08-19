# twistshan/Sudoku_DLM

## Resumen

Sudoku DLM es un conjunto de artefactos de investigación publicados por Twist Shan (twistshan) para comparar el razonamiento en modelos de difusión discreta aplicados a la resolución de Sudoku 9x9. El lanzamiento actual contiene la versión v1 del barrido de profundidad `MDM-no-t` entrenado con semilla 0, que incluye checkpoints para tres profundidades de red (L4, L8 y L16). El modelo está implementado en PyTorch y se distribuye junto con un dataset versionado y scripts de verificación.

El objetivo principal de este proyecto no es ofrecer un producto listo para producción, sino servir como base para estudiar cómo los modelos de difusión discreta razonan sobre problemas estructurados con restricciones, como el Sudoku. El autor tiene intereses declarados en interpretabilidad mecanicista y en la comparación entre arquitecturas generativas, lo que sitúa este modelo en un contexto de investigación académica más que de aplicación comercial.

La relevancia actual de este modelo radica en el creciente interés por los modelos de difusión aplicados a dominios discretos y simbólicos, más allá de la generación de imágenes. Sudoku DLM proporciona un banco de pruebas controlado y reproducible para analizar el comportamiento de estos modelos en tareas de razonamiento lógico, con checkpoints intermedios y finales que permiten estudiar la dinámica de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión discreta (discrete diffusion), variante `MDM-no-t` (Masked Diffusion Model sin condicionamiento temporal explícito) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo opera sobre representaciones de puzzles Sudoku 9x9, no sobre texto libre) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en formato PyTorch) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; trabaja con representaciones simbólicas de Sudoku) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoints `.pt` o similar, dentro de un repo de 3.2 GB) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo más allá de indicar que se trata de un modelo de difusión discreta con la variante `MDM-no-t`. El nombre sugiere un modelo de difusión enmascarado (Masked Diffusion Model) que no utiliza condicionamiento temporal (`no-t`), es decir, que probablemente no incorpora la variable de tiempo t en el proceso de denoising, o lo hace de forma simplificada. Se barajan tres profundidades de red (L4, L8 y L16) para estudiar el efecto de la capacidad del modelo en la tarea.

El entrenamiento se realizó con semilla 0 y se extendió hasta la época 300, equivalente a 57.600 pasos globales. Se guardan dos tipos de checkpoints: `best`, que minimiza la entropía cruzada de denoising en validación, y `final`, que es el estado al final del entrenamiento. El dataset utilizado es `stwistzz/Sudoku_DLM_Reasoning`, que está versionado (v1.1.0) e incluye la procedencia completa de los datos y scripts de verificación. No se especifica si se emplearon técnicas como RLHF o DPO; al ser un modelo de difusión, es probable que el entrenamiento sea puramente supervisado sobre el proceso de denoising.

## Capacidades

- Resolución de Sudoku 9x9: el modelo está entrenado para completar o denoising de puzzles Sudoku representados simbólicamente.
- Razonamiento estructurado: al operar sobre un dominio con restricciones lógicas, el modelo debe aprender a satisfacer las reglas del Sudoku (filas, columnas y cajas sin repeticiones).
- Comparación de profundidades: los checkpoints L4, L8 y L16 permiten analizar cómo la profundidad de la red afecta al rendimiento en esta tarea.
- Reproducibilidad: al incluir manifiestos con SHA-256 y dataset versionado, se facilita la verificación de resultados y la comparación entre ejecuciones.
- Interpretabilidad: el repositorio asociado en GitHub se centra en la interpretabilidad mecanicista del razonamiento en modelos de difusión, por lo que el modelo está diseñado para ser analizado a nivel de activaciones y mecanismos internos.

No se reportan capacidades de generación de texto, tool calling, agentes, visión o audio. El modelo es específico para la tarea de Sudoku.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo permite estudiar cómo una red de difusión discreta representa y manipula restricciones lógicas. Los checkpoints de diferentes profundidades facilitan el análisis de la formación de circuitos internos durante el entrenamiento.
- Benchmark de razonamiento para modelos de difusión: Sudoku DLM puede utilizarse como caso de estudio para comparar el rendimiento de arquitecturas de difusión frente a modelos autorregresivos en tareas simbólicas, siguiendo la línea de benchmarks como Sudoku-Bench de Sakana AI.
- Estudio de dinámicas de entrenamiento: los checkpoints `best` y `final` junto con los logs de entrenamiento (aunque no se incluyen en el repo público) permiten analizar la convergencia y la relación entre la pérdida de denoising y la capacidad de resolver puzzles.
- Desarrollo de métodos de muestreo para difusión discreta: al ser un modelo pequeño y controlado, es adecuado para probar nuevas estrategias de decodificación o de guiado sin necesidad de grandes recursos computacionales.
- Generación de puzzles Sudoku: aunque no es el objetivo declarado, un modelo entrenado para denoising podría adaptarse para generar nuevos puzzles válidos, partiendo de ruido y aplicando el proceso de denoising.
- Educación y divulgación: el modelo y su dataset pueden servir como ejemplo didáctico para explicar el funcionamiento de los modelos de difusión discretos en dominios no lingüísticos, con una tarea fácil de visualizar y verificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión en la resolución de Sudoku, ni comparaciones con otros modelos. El repositorio de GitHub asociado podría contener análisis, pero no se ha accedido a su contenido en esta búsqueda.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la model card.
- El tamaño del repositorio es de 3.2 GB, lo que sugiere que los checkpoints ocupan varios cientos de megabytes cada uno. Asumiendo pesos en FP32, el modelo podría tener del orden de 100-300 millones de parámetros, pero este dato no está confirmado.
- Al ser un modelo PyTorch, puede ejecutarse en cualquier GPU con suficiente VRAM. Para una inferencia rápida, una GPU con al menos 8 GB de VRAM sería suficiente para un modelo de este tamaño, aunque no se puede afirmar con certeza.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje y no está pensado para servir texto.
- Para tareas de investigación, se recomienda una GPU de gama media o alta (por ejemplo, RTX 3090, RTX 4090, A100) para entrenar o evaluar los checkpoints con comodidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (difusión discreta aplicada a Sudoku). Existen benchmarks como Sudoku-Bench de Sakana AI que evalúan LLMs en Sudoku, pero no son modelos de difusión. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación y no está pensado para uso en producción.
- No se especifica la licencia, por lo que su uso comercial es incierto y requiere contactar con el autor.
- No se proporcionan métricas de rendimiento, por lo que no se puede evaluar su eficacia real en la resolución de Sudoku.
- El modelo no procesa lenguaje natural; solo trabaja con representaciones simbólicas de puzzles, lo que limita su aplicabilidad a otros dominios.
- Al ser un modelo de difusión discreta, puede presentar problemas de alucinación en el sentido de generar soluciones que no respetan las restricciones del Sudoku, especialmente con puzzles difíciles o fuera de la distribución de entrenamiento.
- La ausencia de condicionamiento temporal (`no-t`) podría limitar la calidad del denoising en comparación con variantes que sí lo utilizan, aunque esto es una hipótesis no confirmada.
- El dataset y los scripts de verificación están versionados, pero no se incluyen los logs de entrenamiento ni los archivos de W&B, lo que dificulta la reproducción exacta de los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twistshan/Sudoku_DLM
- Dataset asociado: https://huggingface.co/datasets/twistzz/Sudoku_DLM_Reasoning/tree/v1.1.0
- Repositorio GitHub de interpretabilidad: https://github.com/Twist-Shan/DLM_Reasoning_Interp
- Perfil del autor en Hugging Face: https://huggingface.co/twistshan
- Sudoku-Bench de Sakana AI (contexto de benchmarks de razonamiento): https://pub.sakana.ai/sudoku/
