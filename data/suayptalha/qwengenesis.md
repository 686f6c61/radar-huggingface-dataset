# suayptalha/QwenGenesis

## Resumen

QwenGenesis es un proyecto experimental publicado por el usuario suayptalha (Şuayp Talha Kocabay) en Hugging Face que no es un modelo de lenguaje en el sentido convencional, sino una demostración de vida artificial implementada como computación neuronal. El autor toma como referencia arquitectónica el modelo base Qwen/Qwen3.5-4B y extrae su bloque SwiGLU (gate, up y down projections) para construir un circuito neuronal determinista que ejecuta transiciones de estado sobre un mundo celular espacial, simulando nacimiento, depredación, mutación, colapso ecológico y selección evolutiva.

El repositorio incluye dos piezas diferenciadas: por un lado, `genesis_native.safetensors`, que contiene los pesos del circuito Genesis SwiGLU y es independiente del backbone lingüístico preentrenado de Qwen; por otro, el paquete `qwengenesis/`, que implementa el mundo determinista, el circuito compilado, la inferencia en CUDA y un renderizador cinematográfico. El motor Genesis no carga el decodificador de lenguaje preentrenado: ejecuta las transiciones del ecosistema únicamente con su circuito neuronal guardado.

Su relevancia es fundamentalmente investigadora y divulgativa: demuestra que una topología de tipo SwiGLU, con dimensiones compatibles con Qwen3.5, puede comportarse como un autómata celular determinista verificable, con coincidencia de estado binario frente a una referencia y una diferencia absoluta máxima reportada de ~7,13×10⁻¹⁵. No debe confundirse con un LLM utilizable para generación de texto, razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Circuito neuronal SwiGLU estilo Qwen (gate, up y down projections); no es un transformer decoder completo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | en (etiqueta declarada en la model card; el modelo no genera lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`genesis_native.safetensors`) |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 9,4 GB |
| Libreria | PyTorch |
| Descargas | 363 |
| Likes | 1 |

## Arquitectura y entrenamiento

El componente central es un circuito SwiGLU con proyecciones gate, up y down compatibles en dimensión con el MLP de Qwen3.5-4B, pero sin ser capas decodificadoras preentrenadas. El autor indica explícitamente que los experimentos FFN a tamaño completo usan dimensiones MLP compatibles con Qwen3.5, aunque no se trata de capas de un decoder entrenado. El circuito ejecuta transiciones de estado del ecosistema de forma determinista: dado un estado del mundo, produce el siguiente estado binario, y este proceso se compara contra una implementación de referencia.

No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Tampoco se describe un procedimiento de entrenamiento supervisado al uso: el énfasis está en la compilación de pesos y en la verificación de equivalencia funcional. La innovación técnica destacable es la separación entre el backbone lingüístico de Qwen (que no se utiliza en el motor standalone) y el circuito SwiGLU independiente que gobierna la dinámica de vida artificial. Se incluyen scripts de reproducibilidad (`run_checkpoint.py`, `scripts.run_native_scenarios`) y tests comparativos en `qwengenesis_native/`.

## Capacidades

- Simulación de dinámicas de vida artificial sobre un mundo celular espacial determinista.
- Ejecución de transiciones de estado con un circuito SwiGLU independiente del modelo de lenguaje base.
- Reproducción de escenarios ecológicos: evolución, colapso ecológico y "apocalipsis de depredadores".
- Inferencia en CUDA para escenarios a tamaño completo (96×96) y ejecución standalone en CPU/GPU para el checkpoint nativo.
- Verificación de equivalencia bit a bit frente a una implementación de referencia.
- Renderizado cinematográfico de los estados simulados a MP4 mediante `imageio`/`imageio-ffmpeg`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni generación de texto: no es un LLM funcional.

## Casos de uso

- Investigación en vida artificial y autómatas celulares: el circuito permite estudiar nacimiento, depredación y selección evolutiva en un mundo espacial con transiciones deterministas y verificables frente a una referencia.
- Docencia y divulgación de computación neuronal: los tres vídeos de demostración (evolución dorada, colapso ecológico, apocalipsis de depredadores) sirven para ilustrar cómo pesos neuronales pueden implementar reglas de un ecosistema sin un LLM.
- Reproducción de experimentos de sistemas dinámicos: los scripts `run_checkpoint.py` y `scripts.run_native_scenarios` permiten replicar escenarios con semillas fijas (por ejemplo, `--seed 93 --size 24`) y comparar estados binarios.
- Validación de implementaciones SwiGLU: `qwengenesis_native/` incluye una implementación estilo Qwen y tests de comparación, útil para verificar portabilidad numérica de circuitos SwiGLU entre backends.
- Generación de material visual para investigación: el renderizador produce MP4 interpolados entre estados simulados, aprovechables en publicaciones o presentaciones sobre dinámica ecológica simulada.
- Experimentación con dimensiones MLP compatibles con Qwen3.5: el proyecto permite probar circuitos FFN a tamaño completo en A100 con verificación de estado binario, como banco de pruebas de compilación de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). La model card sí reporta verificaciones de equivalencia funcional del circuito, que se recogen a continuación:

| Prueba | Configuracion | Resultado reportado |
|---|---|---|
| SwiGLU vs referencia | 3 × 100 pasos, mundo 24×24 | Coincidencia de estado binario; diferencia absoluta máxima ~7,13×10⁻¹⁵ |
| FFN Qwen3.5 a tamaño completo | A100, 3 × 10 ticks | Coincidencia de estado binario |
| Escenario `predator_apocalypse` | 96×96, 70 pasos | Todos los frames de salida coinciden con la referencia |
| Escenario `ecological_collapse` | 96×96, 150 pasos | Todos los frames de salida coinciden con la referencia |
| Escenario `golden_evolution` | 96×96, 180 pasos | Todos los frames de salida coinciden con la referencia |
| Trayectoria de depredadores (apocalipsis) | Pasos 10/20/30/40 | 2.795 / 1.523 / 91 / 0 individuos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 9,4 GB, por lo que el checkpoint nativo en safetensors requiere espacio en disco y memoria proporcional a sus pesos (no cuantificados en la información disponible).
- GPU recomendadas: el autor reporta experimentos FFN a tamaño completo en A100; los escenarios nativos requieren CUDA GPU (`--device cuda`).
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el checkpoint nativo standalone puede ejecutarse con `run_checkpoint.py`, pero no se especifica VRAM mínima.
- Opciones de despliegue: ejecución directa con PyTorch (`python run_checkpoint.py`, `python -m scripts.run_native_scenarios`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con que no es un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. QwenGenesis no es comparable con LLM de propósito general ni con modelos de vida artificial publicados en la información proporcionada; su base arquitectónica (Qwen3.5-4B) se usa solo como referencia dimensional del bloque SwiGLU, no como modelo funcional equivalente.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni responde preguntas; su uso como LLM sería un error de categoría.
- El motor Genesis standalone no carga el decodificador preentrenado de Qwen3.5-4B; los pesos del circuito son independientes del backbone lingüístico.
- El movimiento visual entre estados simulados está interpolado por el renderizador; la apariencia de los vídeos es ilustrativa y no constituye una medición del movimiento individual independiente.
- El proyecto se etiqueta como experimental; no hay garantías de estabilidad, soporte ni mantenimiento.
- Solo se declara el idioma inglés en los metadatos, aunque el modelo no procesa lenguaje natural.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, al no haber generación de texto; no se documentan sesgos.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; el autor atribuye Qwen3.5-4B a Qwen bajo Apache-2.0.
- Para producción, la ausencia de benchmarks convencionales, de especificación de VRAM y de soporte de frameworks de serving desaconseja su uso fuera de contextos de investigación o demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suayptalha/QwenGenesis
- Variante relacionada: https://huggingface.co/suayptalha/QwenGenesis-4B
- Perfil del autor: https://huggingface.co/suayptalha
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Vídeos de demostración (en el repo): `videos/golden_evolution.mp4`, `videos/ecological_collapse.mp4`, `videos/predator_apocalypse.mp4`
