# tetraturtle/G4-LuneLight-31B-exl3

## Resumen

G4-LuneLight-31B-exl3 es una cuantización en formato EXL3 (ExLlamaV3) del modelo base G4/LuneLight-31B, un transformer de 31.000 millones de parámetros. La cuantización la publica el usuario tetraturtle mediante la herramienta ezexl3, que genera automáticamente repositorios con múltiples revisiones a distintos bits por peso (bpw). El objetivo es reducir el peso en disco y la VRAM necesaria para inferencia manteniendo la fidelidad respecto al modelo original en bf16.

El repositorio ofrece cuatro revisiones cuantizadas: 3,00 bpw (14,29 GiB), 3,10 bpw (14,63 GiB), 3,25 bpw (15,14 GiB) y 6,00 bpw (24,52 GiB), frente a los 58,25 GiB del modelo en bf16. La model card incluye gráficas de divergencia KL y perplejidad frente a bits por peso que permiten evaluar el compromiso entre compresión y degradación.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantización, no de un modelo nuevo. No hay información publicada sobre arquitectura interna, datos de entrenamiento, contexto, idiomas ni benchmarks del modelo base, por lo que la mayor parte de las especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base G4/LuneLight-31B; transformer de 31B según fuentes de terceros) |
| Parametros totales | 31B (según el nombre del modelo y fuentes de terceros) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,00 bpw, 3,10 bpw, 3,25 bpw y 6,00 bpw; referencia bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (ExLlamaV3); el bf16 original en formato no especificado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base G4/LuneLight-31B en la documentación proporcionada. El nombre y las fuentes de terceros indican 31.000 millones de parámetros, pero no se detalla si emplea atención estándar, variantes lineales, mezcla de expertos u otro esquema. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La única información técnica verificable corresponde al proceso de cuantización: las revisiones se generaron con exllamav3 a través de ezexl3, una herramienta que automatiza la producción de repositorios EXL3 e incluye gráficas de divergencia KL media, perplejidad y distribuciones de divergencia KL por token frente a bits por peso. Estas gráficas permiten al usuario seleccionar la revisión con el mejor compromiso entre tamaño y fidelidad, pero no aportan datos sobre el entrenamiento del modelo original.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de 31B, aunque no se documenta explícitamente.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en GPU de consumo con ExLlamaV3: la revisión de 3,00 bpw ocupa 14,29 GiB y permite ejecutar un modelo de 31B en tarjetas con 16-24 GB de VRAM, algo inviable con el bf16 de 58,25 GiB.
- Servicio de inferencia con requisitos de memoria ajustados: la revisión de 6,00 bpw (24,52 GiB) ofrece mayor fidelidad que las de 3 bpw y encaja en GPUs de 32 GB o en configuraciones multi-GPU pequeñas.
- Evaluación comparativa de cuantizaciones: las gráficas de divergencia KL y perplejidad permiten seleccionar la revisión adecuada según el presupuesto de memoria y la tolerancia a degradación.
- Investigación sobre compresión de modelos: el repositorio sirve como caso de estudio de cuantización EXL3 a distintos bpw sobre un mismo modelo base.
- Prototipado local de aplicaciones de lenguaje: al reducir el peso a 14-25 GiB, facilita pruebas en estaciones de trabajo sin clústeres dedicados.
- Reproducción de pipelines con ezexl3: el flujo documentado (descarga por revisión con `hf download`) permite integrar la cuantización en entornos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye gráficas de divergencia KL media, perplejidad y distribuciones de divergencia KL por token frente a bits por peso, sin valores numéricos tabulados ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,29 GiB (3,00 bpw), 14,63 GiB (3,10 bpw), 15,14 GiB (3,25 bpw) y 24,52 GiB (6,00 bpw), según los tamaños de repositorio indicados; el bf16 requiere 58,25 GiB.
- GPU recomendadas: no disponibles en la documentación; por tamaño, las revisiones de 3 bpw encajan en GPUs de 16-24 GB y la de 6 bpw en GPUs de 32 GB o superiores.
- GPU de consumo: las revisiones de 3 bpw son compatibles con tarjetas de 16 GB o más; la de 6 bpw requiere 24 GB o más.
- Opciones de despliegue: ExLlamaV3 (formato EXL3); no se documentan otros motores compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G4-LuneLight-31B-exl3 (este) | 31B | no disponible | EXL3 (3,00-6,00 bpw) | Apache 2.0 | Hugging Face |
| G4-LuneLight-31B (base) | 31B | no disponible | bf16 | no disponible | Hugging Face (G4/LuneLight-31B) |
| G4-LuneLight-31B-mlx-4Bit (ailexleon) | 31B | no disponible | MLX 4-bit | no disponible | Hugging Face |
| G4-LuneLight-31B (zerofata) | 31B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Es un artefacto de cuantización: la calidad final depende de la degradación introducida por EXL3 a cada bpw, que debe evaluarse con las gráficas de divergencia KL y perplejidad incluidas.
- No hay información sobre sesgos del modelo base; no puede descartarse la presencia de sesgos heredados del entrenamiento original.
- Riesgo de alucinación: no documentado para el modelo base ni para las cuantizaciones.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 declarada en el repositorio, lo que en principio permite uso comercial; sin embargo, la licencia del modelo base G4/LuneLight-31B no se especifica en la información disponible y conviene verificarla antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- Solo es compatible con ExLlamaV3; no se documenta soporte para llama.cpp, vLLM, Ollama u otros motores.
- El modelo base no cuenta con model card detallada en la información proporcionada, lo que impide verificar arquitectura, contexto y datos de entrenamiento.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/tetraturtle/G4-LuneLight-31B-exl3
- Modelo base: https://huggingface.co/G4/LuneLight-31B
- Herramienta ezexl3: https://github.com/UnstableLlama/ezexl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Réplica del modelo base por zerofata: https://huggingface.co/zerofata/G4-LuneLight-31B
- Cuantización MLX 4-bit por ailexleon: https://llm-explorer.com/model/ailexleon%2FG4-LuneLight-31B-mlx-4Bit,6ZdfhV0z6ZdWD5TTyxCVTG
