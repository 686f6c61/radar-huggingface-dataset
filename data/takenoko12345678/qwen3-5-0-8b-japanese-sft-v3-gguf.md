# Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v3-GGUF

## Resumen

Qwen3.5-0.8B-Japanese-SFT-v3-GGUF es una coleccion de pesos cuantizados en formato GGUF para llama.cpp, derivada del modelo afinado Qwen3.5-0.8B-Japanese-SFT-v3, que a su vez parte de Qwen/Qwen3.5-0.8B. El autor es Takenoko12345678, que publica tanto la version principal de 24 capas (GA) como una variante derivada de 28 capas basada en un transformer con bucle sin entrenamiento adicional (Training-Free Looped Transformer). El objetivo es ofrecer un modelo japones pequeno, ligero y desplegable en CPU, movil o navegador, manteniendo calidad conversacional y de razonamiento en japones.

El modelo base tiene 752.393.024 parametros reales segun safetensors, lo que lo situa en la categoria sub-1B. La aportacion principal de esta publicacion es el uso de una importance matrix (imatrix) construida especificamente con un corpus japones de conversacion y razonamiento (v2.5-Data Stage 2), aplicada a las cuantizaciones Q4_K_M y Q5_K_M para reducir la perdida de calidad en japones respecto a una cuantizacion generica.

Es relevante ahora porque demuestra una practica cada vez mas extendida: la cuantizacion consciente del idioma mediante imatrix especifica permite que modelos pequenos rindan aceptablemente en lenguas no inglesas con requisitos de hardware minimos. La variante 28L-Loop, ademas, explora tecnicas de inferencia con bucle de capas sin reentrenamiento, un area activa de investigacion. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B); variante derivada con bucle de capas sin entrenamiento (28L-Loop) |
| Parametros totales | 752.393.024 (modelo base); variante 28L-Loop no disponible en detalle |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 (Q4_K_M y Q5_K_M con imatrix japonesa) |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.5 con 752 millones de parametros. Sobre el se aplico un ajuste supervisado (SFT) orientado a japones, del que no se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La model card menciona un corpus denominado v2.5-Data Stage 2, empleado tanto para el ajuste como para construir la importance matrix de cuantizacion.

La innovacion tecnica destacable es doble. Por un lado, la cuantizacion con imatrix especifica de japones en Q4_K_M y Q5_K_M, que calibra la importancia de los pesos con datos representativos del idioma objetivo. Por otro, la variante 28L-Loop, descrita en el paper arXiv:2605.23872, que aplica un transformer con bucle de capas (capas L16 a L19, con coeficiente beta de 0,8) para aumentar la profundidad efectiva sin entrenamiento adicional. Segun la model card, esta variante alcanza 78,82% en JCommonsenseQA en un solo paso y 28,0% en MGSM-ja.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Razonamiento con modo de pensamiento (thinking mode), con ajustes de muestreo recomendados (temp 0,7, top-p 0,95, top-k 20, presence penalty 1,5).
- Razonamiento matematico en japones, evaluado mediante MGSM-ja.
- Razonamiento de sentido comun en japones, evaluado mediante JCommonsenseQA.
- Capacidad multilingue limitada a japones e ingles segun los metadatos.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes multi-paso ni de vision o audio.
- Despliegue en llama.cpp, incluido entorno de navegador mediante wllama segun la model card.

## Casos de uso

- Asistentes conversacionales en japones en dispositivos de bajos recursos: la cuantizacion Q4_K_M con imatrix japonesa permite ejecutar el modelo en CPU, movil o navegador manteniendo calidad aceptable en conversacion multi-turno en japones.
- Prototipado rapido de chatbots japoneses: al caber en memoria modesta y ejecutarse con llama.cpp, sirve para validar flujos conversacionales antes de invertir en modelos mayores.
- Educacion y tutoria en japones: el modo de pensamiento y la evaluacion en JCommonsenseQA lo hacen util para responder preguntas de conocimiento general y sentido comun en japones.
- Razonamiento matematico basico en japones: la evaluacion en MGSM-ja indica capacidad para resolver problemas aritmeticos planteados en lengua japonesa, util en herramientas educativas.
- Despliegue en navegador con wllama: permite ofrecer un asistente japones totalmente local en una aplicacion web sin servidor backend, con implicaciones de privacidad.
- Investigacion sobre cuantizacion consciente del idioma: el par de cuantizaciones con imatrix japonesa frente a las genericas sirve como caso de estudio reproducible para medir el impacto de la imatrix en lenguas no inglesas.
- Experimentacion con transformers de bucle sin entrenamiento: la variante 28L-Loop permite estudiar tecnicas de profundidad efectiva sin coste de reentrenamiento.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a la variante 28L-Loop:

| Benchmark | Variante 28L-Loop |
|---|---|
| JCommonsenseQA (1-pass) | 78,82% |
| MGSM-ja | 28,0% |

No se han publicado en la informacion disponible resultados de benchmarks para la version principal de 24 capas (GA), ni comparaciones numericas con otros modelos en esta ficha. La model card remite a la tabla comparativa del repositorio principal con prueba de McNemar sobre cuatro modelos (base oficial, v2.5, v3 24L y 28L-Loop), pero esos valores no estan incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q4_K_M en torno a 0,5 GB, Q5_K_M en torno a 0,6 GB, Q8_0 en torno a 0,8 GB y F16 en torno a 1,5 GB (estimaciones a partir de 752 millones de parametros; el tamano exacto de cada archivo no se detalla en la informacion disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; las cuantizaciones Q4_K_M y Q5_K_M funcionan tambien en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, entre otras) e incluso en moviles y navegador.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), wllama en navegador; otras herramientas compatibles con GGUF no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; la model card describe el Q4_K_M como "muy rapido" en movil, CPU y navegador, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Japanese-SFT-v3-GGUF | 752 M | No disponible | ja, en | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-0.8B (base) | 752 M | No disponible | No disponible | No disponible en esta ficha | safetensors |
| Qwen3.5-0.8B-Japanese-SFT-v3 (sin cuantizar) | 752 M | No disponible | ja, en | Apache 2.0 | safetensors |
| Qwen3.5-0.8B-Japanese-SFT-v3-28L-Loop | No disponible | No disponible | ja, en | Apache 2.0 | GGUF, safetensors |

No se dispone en la informacion proporcionada de datos de rendimiento comparables con modelos de otras familias del mismo tamano, por lo que la comparativa se limita a las variantes del propio autor.

## Limitaciones y advertencias

- El modelo tiene 752 millones de parametros: su capacidad de razonamiento complejo, conocimiento factual y coherencia en contextos largos es limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion inherente a modelos pequenos, especialmente en preguntas factuales y en temas fuera del corpus de ajuste.
- Cobertura linguistica restringida a japones e ingles; el rendimiento en castellano u otras lenguas no esta documentado y previsiblemente sera deficiente.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar conversaciones o documentos largos.
- Las cuantizaciones Q4_K_M y Q5_K_M estan optimizadas para japones; su calidad en ingles puede diferir de la de una imatrix generica.
- La variante 28L-Loop modifica el grafo de inferencia respecto al modelo estandar; conviene validar su comportamiento en la herramienta de despliegue concreta.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en produccion.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-0.8B y citar adecuadamente el paper asociado a la variante 28L-Loop.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v3-GGUF
- Modelo base sin cuantizar: https://huggingface.co/Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v3
- Variante 28L-Loop: https://huggingface.co/Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v3-28L-Loop
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de referencia (28L-Loop): https://arxiv.org/abs/2605.23872
