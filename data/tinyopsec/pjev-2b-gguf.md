# tinyopsec/pjev-2b-GGUF

## Resumen

pjev-2b (en su variante GGUF, publicada por tinyopsec) es la cuantización en formato GGUF de `Kailune-AI/pjev-2b`, un modelo de decisión tipado (typed-decision model) construido sobre `openbmb/MiniCPM5-2B`, un modelo de arquitectura Llama con aproximadamente 2,5 mil millones de parámetros. A diferencia de un modelo conversacional convencional, pjev-2b está diseñado para devolver probabilidades calibradas sobre un conjunto fijo de opciones proporcionadas por el usuario, lo que lo convierte en una herramienta para tareas de clasificación y toma de decisiones estructurada en lugar de para generación libre de texto.

El modelo resuelve el problema de obtener salidas probabilísticas fiables y deterministas sobre opciones predefinidas (por ejemplo, elegir entre categorías, rutas de acción o respuestas tipadas) sin depender de un LLM generalista de mayor tamaño. Su relevancia reside en el nicho de los decision models, una categoría emergente que aprovecha modelos pequeños y eficientes para tareas de decisión de bajo coste y baja latencia.

Al tratarse de una cuantización GGUF, el modelo está pensado para ejecutarse localmente con llama.cpp y runtimes compatibles (Ollama, LM Studio, koboldcpp), con versiones desde 2 bits (Q2_K) hasta precisión completa F16. La licencia es Apache 2.0, heredada del modelo base. No se ha publicado información sobre longitud de contexto, idiomas soportados ni datos de entrenamiento específicos del ajuste a modelo de decisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (basada en MiniCPM5-2B), modelo de decisión tipado |
| Parámetros totales | 2.516.756.480 (~2,5B) |
| Parámetros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

pjev-2b parte de openbmb/MiniCPM5-2B, un modelo de arquitectura Llama (transformer decoder autorregresivo) con unos 2,5 mil millones de parámetros. Sobre esa base, el equipo de Kailune-AI lo ha convertido en un modelo de decisión tipado: en lugar de generar texto libre, el modelo devuelve probabilidades calibradas sobre un conjunto fijo de opciones que el usuario define en el prompt. No se ha publicado información sobre el método de entrenamiento o ajuste específico (SFT, RLHF, DPO), el dataset empleado ni el número de tokens.

La innovación destacable es el enfoque de salida: en lugar de decodificación libre, el modelo se evalúa sobre opciones tipadas, lo que permite obtener distribuciones de probabilidad directamente comparables y calibradas. No hay información disponible sobre técnicas como decodificación especulativa, attention lineal u otras optimizaciones arquitectónicas. Los pesos publicados en este repositorio son cuantizaciones GGUF producidas con llama.cpp.

## Capacidades

- Devolución de probabilidades calibradas sobre un conjunto fijo de opciones definidas por el usuario (typed decisions).
- Clasificación estructurada de entradas de texto en categorías predefinidas.
- Toma de decisiones automatizada en flujos donde se necesita elegir entre alternativas discretas.
- Ejecución local completa mediante llama.cpp y runtimes GGUF compatibles (Ollama, LM Studio, koboldcpp).
- No es un modelo de chat de propósito general: la propia model card advierte expresamente que no debe usarse como modelo conversacional generalista.
- No hay información disponible sobre soporte de tool calling, agentes, capacidades multilingües, visión o audio.

## Casos de uso

- Clasificación de tickets de soporte: dada una lista fija de categorías (facturación, técnico, quejas), el modelo devuelve la distribución de probabilidad sobre ellas, permitiendo enrutar tickets con un umbral de confianza configurable.
- Moderación de contenido con etiquetas fijas: se pueden definir categorías de moderación y usar las probabilidades calibradas para decidir si un mensaje requiere revisión humana.
- Enrutado de consultas en sistemas multi-modelo: actúa como clasificador barato y de baja latencia que decide qué modelo especializado procesa cada petición en un pipeline de inferencia.
- Selección de acciones en agentes: en un flujo agéntico, puede elegir entre un conjunto limitado de acciones tipadas (buscar, responder, escalar) devolviendo probabilidades sobre cada una.
- Validación de decisiones de negocio: escenarios donde se necesita una probabilidad auditable sobre opciones discretas (aprobar/rechazar/escalar) en lugar de texto libre difícil de parsear.
- Ejecución en dispositivos con recursos limitados: gracias a las cuantizaciones de 2 a 4 bits, puede desplegarse en portátiles o máquinas sin GPU para tareas de decisión en local, sin enviar datos a servicios externos.
- Prototipado de sistemas de decisión: integración rápida en aplicaciones mediante llama.cpp u Ollama para evaluar si un decision model encaja antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo F16 ocupa 5,0 GB; las cuantizaciones Q4_K_M o Q4_0 rondarán aproximadamente 1,5–2 GB, y Q2_K menos de 1 GB (tamaños exactos por archivo no disponibles; el repo completo pesa 24,6 GB).
- Al ser un modelo de ~2,5B parámetros, cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) ejecuta la versión F16, y las cuantizaciones Q4 o inferiores funcionan incluso solo con CPU y RAM.
- No requiere GPUs de datacenter (A100/H100) para inferencia.
- Despliegue: llama.cpp (comando `llama-cli` documentado en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de 2,5B con cuantizaciones agresivas, se espera baja latencia en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pjev-2b (GGUF) | ~2,5B | Modelo de decisión tipado (base MiniCPM5-2B) | no disponible | Apache 2.0 | GGUF público en Hugging Face |
| openbmb/MiniCPM5-2B (base) | ~2,5B | LLM generalista conversacional | no disponible | no disponible en la información proporcionada | Pesos públicos en Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | LLM generalista | 32K (según ficha oficial) | Qwen license (uso comercial condicionado) | Pesos y GGUF comunitarios |

Nota: no existen muchos modelos comparables públicos de la categoría "typed-decision model"; la comparativa se limita a alternativas de tamaño similar. No se han publicado benchmarks que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general: la model card lo advierte expresamente; usarlo para conversación libre producirá resultados inadecuados.
- Riesgo de calibración incorrecta: la calidad de las probabilidades devueltas depende del ajuste del modelo de decisión; la propia model card recomienda evaluar antes de usarlo en producción.
- No hay información publicada sobre idiomas soportados, sesgos conocidos ni longitud de contexto, lo que dificulta evaluar su idoneidad para castellano u otras lenguas.
- Cuantizaciones agresivas (Q2_K, Q3) pueden degradar la calibración de las probabilidades, que es precisamente la función principal del modelo; se recomienda la cuantización recomendada por el autor (Q4_K_M) o superior para uso serio.
- Licencia Apache 2.0: sin restricciones de uso comercial significativas, aunque hay que respetar los términos de la licencia del modelo base (openbmb/MiniCPM5-2B).
- Proyecto de nicho con muy poca tracción pública (441 descargas, 0 likes en el momento de la ficha), sin comunidad de soporte ni documentación extensa.
- Alucinación: en su uso previsto (probabilidades sobre opciones fijas) el riesgo es bajo, pero cualquier uso fuera de ese ámbito no está soportado ni evaluado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/pjev-2b-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/Kailune-AI/pjev-2b
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
