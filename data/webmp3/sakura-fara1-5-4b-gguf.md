# webmp3/Sakura-Fara1.5-4B-GGUF

## Resumen

Sakura-Fara1.5-4B-GGUF es una cuantización comunitaria en formato GGUF del modelo microsoft/Fara1.5-4B, un agente de uso de computador orientado a la navegación web desarrollado por Microsoft. El modelo base emplea una arquitectura derivada de Qwen3.5 y es multimodal: procesa capturas de pantalla del navegador y emite llamadas a herramientas estructuradas, lo que lo sitúa en la categoría de agentes visuales capaces de operar interfaces gráficas de forma autónoma. Esta publicación, mantenida por el usuario webmp3 dentro de la línea Sakura Mini, no es una versión oficial de Microsoft, sino una conversión independiente.

El repositorio ofrece tres archivos GGUF de distinto tamaño (1,89 GiB, 2,29 GiB y 2,66 GiB) generados con un método propio de asignación mixta de códecs, en el que el presupuesto de bits por tensor se decide a partir de la sensibilidad medida empíricamente mediante divergencia KL, en lugar de aplicar reglas fijas. El modelo cuenta con 4.205.751.296 parámetros totales y se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integración en herramientas de inferencia local.

La relevancia de esta ficha reside en que permite ejecutar un agente de navegación multimodal de 4B parámetros en hardware de consumo, algo inviable con los pesos en BF16 originales (aproximadamente 8 GB). El autor reporta reducciones de divergencia KL frente a cuantizaciones de referencia de bartowski en tamaños comparables, si bien esas métricas se limitan a perplejidad y KL sobre textos cortos, no a benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5 (modelo base microsoft/Fara1.5-4B); incluye capas de predicción multi-token y proyector de visión |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | Tres archivos GGUF mixtos: 3,83 bpw (IQ4_XS 35 %, IQ3_S 33 %, Q3_K 14 %, Q4_K 12 %, IQ3_XXS 3 %, Q5_K 2 %); 4,65 bpw (IQ4_XS 63 %, Q5_K 36 %); 5,42 bpw (Q5_K 92 %, IQ4_XS 7 %). Proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (compatible con llama.cpp estándar); proyector de visión `mmproj-Fara1.5-4B-f16.gguf` en F16 |

## Arquitectura y entrenamiento

El modelo base Fara1.5-4B es un transformer multimodal construido sobre Qwen3.5, diseñado específicamente como agente de uso de computador para navegación web. Recibe capturas de pantalla del navegador como entrada visual y genera llamadas a herramientas estructuradas como salida, lo que implica un entrenamiento orientado a la interacción con entornos gráficos y a la planificación de acciones multi-paso. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta publicación no está en el modelo base, sino en el proceso de cuantización. El autor parte del GGUF en BF16 y de la importance matrix de bartowski/Fara1.5-4B-GGUF, cuantiza cada matriz grande con diez tipos candidatos (Q2_K, IQ2_S, IQ3_XXS, IQ3_S, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0) y estima el error por matriz ponderado por importancia. Ese error se escala con un factor de sensibilidad medido mediante divergencia KL real: cada grupo de tensores (proyecciones down del FFN, proyecciones value de atención, primeras y últimas capas) se degrada de forma aislada y se compara el impacto en KL con su error de cuantización. Finalmente, una asignación exacta de presupuesto tipo mochila múltiple elige un tipo por matriz para cada tamaño objetivo, y el modelo se ensambla a partir de los tensores ya almacenados sin recuantizar. Las normas, los tensores pequeños y las capas de predicción multi-token permanecen en alta precisión.

## Capacidades

- Comprensión de imágenes: procesa capturas de pantalla de navegador como entrada image-text-to-text mediante el proyector de visión incluido.
- Generación de llamadas a herramientas estructuradas para interactuar con entornos web (clics, navegación, entrada de texto).
- Razonamiento multi-paso y planificación de acciones propias de un agente de uso de computador.
- Ejecución local en llama.cpp con tipos ggml estándar, sin parches ni kernels personalizados.
- Capacidades conversacionales (etiqueta `conversational` en el repositorio).
- Capacidades multilingües: no disponible.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Automatización de pruebas de interfaz web: el modelo puede recibir capturas de pantalla de una aplicación y emitir acciones estructuradas para recorrer flujos de usuario, integrándose en pipelines de QA que verifiquen regresiones visuales y funcionales en cada despliegue.
- Agente de navegación asistida en local: al ejecutarse en llama.cpp con archivos de 1,89 a 2,66 GiB, permite desplegar un agente que rellena formularios, extrae datos de portales y navega entre páginas sin enviar capturas de pantalla a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Extracción de información de interfaces gráficas: dado un pantallazo de un panel administrativo o de un portal público, el modelo identifica los elementos relevantes y genera la secuencia de acciones para llegar al dato buscado, útil en procesos de scraping ético sobre interfaces sin API.
- Automatización de tareas repetitivas de back office: con el archivo de 2,29 GiB como equilibrio entre tamaño y calidad, se puede desplegar en estaciones de trabajo con GPU de consumo para tareas de cumplimentación de formularios internos y consulta de sistemas legacy basados en web.
- Asistente de accesibilidad: el modelo puede interpretar la pantalla y proponer o ejecutar acciones para usuarios con dificultades motoras, traduciendo instrucciones en lenguaje natural a interacciones concretas sobre la interfaz.
- Prototipado de agentes en investigación: la licencia MIT y el formato GGUF estándar permiten experimentar con planificación visual y tool calling en un solo equipo, comparando las tres cuantizaciones para estudiar el impacto de la compresión en el comportamiento del agente.
- Evaluación de robustez de cuantizaciones: los tres archivos con presupuestos de bits distintos sirven como banco de pruebas para medir cómo afecta la cuantización mixta a tareas agénticas reales, más allá de la perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor proporciona exclusivamente métricas de fidelidad de la cuantización frente al original en BF16, medidas con `llama-perplexity` sobre 12 fragmentos de 512 tokens por texto:

| Cuantizacion | Tamano | KLD en | KLD dev | KLD wiki | PPL en | Mismo token top (media) |
|---|---:|---:|---:|---:|---:|---:|
| Sakura 1.89GiB (3,83 bpw) | 1,89 GiB | 0,0968 | 0,0898 | 0,1496 | 2,262 | 86,9 % |
| IQ3_XXS (bartowski) | 1,97 GiB | 0,1590 | 0,1526 | 0,2436 | 2,368 | 84,7 % |
| Sakura 2.29GiB (4,65 bpw) | 2,29 GiB | 0,0332 | 0,0303 | 0,0484 | 2,201 | 92,6 % |
| IQ4_XS (bartowski) | 2,37 GiB | 0,0425 | 0,0364 | 0,0505 | 2,211 | 92,2 % |
| Sakura 2.66GiB (5,42 bpw) | 2,66 GiB | 0,0136 | 0,0160 | 0,0216 | 2,177 | 95,2 % |
| Q4_K_M (bartowski) | 2,69 GiB | 0,0257 | 0,0266 | 0,0351 | 2,186 | 93,9 % |
| Q5_K_M (bartowski) | 3,09 GiB | 0,0086 | 0,0077 | 0,0103 | 2,173 | 96,8 % |

Referencia BF16: PPL en 2,169, dev 2,242, wiki 10,998. El autor advierte que las diferencias pequeñas de KL a tamaño similar no constituyen un ranking de calidad y que las mediciones se hicieron en una sola máquina.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan entre 1,88 y 2,65 GiB según el archivo; hay que sumar el proyector de visión F16 (`mmproj-Fara1.5-4B-f16.gguf`) y la caché KV, cuyo tamaño depende del contexto configurado (no disponible). En la práctica, entre 3 y 5 GB de VRAM o memoria unificada cubren el modelo con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el archivo pequeño; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 lo ejecutan con holgura. También es viable en CPU con RAM suficiente y en Apple Silicon con memoria unificada.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 6 GB o más; el archivo de 1,89 GiB está pensado para presupuestos de memoria ajustados.
- Opciones de despliegue: llama.cpp (soporte nativo, al ser tipos ggml estándar), Ollama y cualquier frontend compatible con GGUF multimodal que acepte el par modelo + mmproj. vLLM y TGI no se mencionan como soportados para este formato en la información disponible.
- Latencia y throughput: no disponibles. El tamaño reducido sugiere tiempos de carga y generación bajos en GPU de consumo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

La información disponible solo permite comparar con las cuantizaciones de referencia del mismo modelo base, no con otros modelos de la misma categoría:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sakura-Fara1.5-4B-GGUF (esta ficha) | 4,2 B | no disponible | MIT | GGUF (3 tamanos) | Cuantización mixta con asignación por sensibilidad medida |
| bartowski/Fara1.5-4B-GGUF | 4,2 B | no disponible | MIT (heredada del base) | GGUF (escala estándar) | Referencia de comparación; IQ3_XXS, IQ4_XS, Q4_K_M, Q5_K_M |
| microsoft/Fara1.5-4B | 4,2 B | no disponible | MIT | safetensors (BF16) | Modelo original; requiere ~8 GB en BF16 |

No se dispone de datos para comparar con otros agentes de uso de computador de tamaño similar (por ejemplo, variantes de UI-TARS u otros modelos de la familia Fara) en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas son de fidelidad de cuantización (KL y perplejidad sobre textos cortos), no de calidad en tareas agénticas; no deben interpretarse como garantía de rendimiento en navegación real.
- La cuantización siempre degrada la calidad; el archivo de 1,89 GiB es el que más se aleja del original (86,9 % de coincidencia en el token más probable frente a 95,2 % del mayor).
- Fara es un agente de uso de computador: Microsoft recomienda ejecutarlo únicamente dentro de un sandbox con monitorización (MagenticLite) y describe comportamientos de seguridad que deben respetarse. Ejecutarlo con acceso libre al navegador o al sistema de archivos entraña riesgos de acciones no deseadas.
- Riesgo de alucinación en la interpretación de capturas de pantalla y en la generación de llamadas a herramientas: una acción mal estructurada puede provocar clics o envíos de formularios erróneos.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al inglés.
- Longitud de contexto no disponible; conviene verificar la configuración de llama.cpp antes de usar conversaciones largas o historiales extensos de pantallas.
- Esta publicación es una cuantización comunitaria no oficial; para producción conviene validar el comportamiento frente a los pesos originales de Microsoft.
- Licencia MIT: permite uso comercial, pero el aviso de copyright y la licencia deben conservarse; verificar las condiciones del modelo base microsoft/Fara1.5-4B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-Fara1.5-4B-GGUF
- Modelo base: https://huggingface.co/microsoft/Fara1.5-4B
- GGUF de referencia de bartowski: https://huggingface.co/bartowski/Fara1.5-4B-GGUF
- Colección Sakura Mini: https://huggingface.co/collections/webmp3/sakura-mini-6aba73f6a5a41296a3540373
- llama.cpp: https://github.com/ggml-org/llama.cpp
