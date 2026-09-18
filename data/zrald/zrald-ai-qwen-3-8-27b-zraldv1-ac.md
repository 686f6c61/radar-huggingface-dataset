# Zrald/Zrald-AI-qwen-3.8-27b-zraldv1-ac

## Resumen

Zrald-AI Qwen 3.8 27B (zraldv1-ac) es una publicación de pesos cuantizados en formato GGUF del modelo base Qwen/Qwen3.8-27B, distribuida por el usuario Zrald bajo licencia Apache 2.0. El repositorio contiene un único fichero, `zraldv1-ac.gguf`, de 17,08 GiB (18,34 GB), etiquetado por el autor como "Accuracy Priority Tier", es decir, una cuantización diseñada para priorizar la retención de precisión frente al ahorro de memoria. El modelo base declara 27.320.697.856 parámetros totales (unos 27,3 mil millones) según los metadatos de safetensors del propio repositorio.

El problema que aborda es el habitual en el despliegue local de modelos grandes: servir un modelo de ~27B con una pérdida de calidad mínima y un consumo de VRAM contenido. Según la model card, esta cuantización retiene un 99,68 % de precisión respecto a su referencia, iguala o supera a Q6_K y Q8_0 en precisión de benchmark y ahorra aproximadamente 10 GB de VRAM, con un mínimo recomendado de 20 GB. El autor reporta además medidas físicas tomadas sobre hardware AMD Instinct MI300X: 1.344,4 tokens/s de procesamiento de prompt y 69,4 tokens/s de generación.

La relevancia del modelo es acotada y hay que ser prudente: el repositorio no registra descargas ni "likes", la model card no documenta la arquitectura, el contexto, los idiomas soportados ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), y no se ha encontrado documentación pública verificable del modelo base Qwen/Qwen3.8-27B en la búsqueda web realizada. Todo apunta a un artefacto de cuantización experimental más que a un modelo con validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la especifica; etiquetas de familia Qwen) |
| Parámetros totales | 27.320.697.856 (≈27,3 mil millones, dato de safetensors del repositorio) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No especificada en la ficha; los ejemplos de llama.cpp usan 4.096, 8.192 y 16.384 tokens |
| Tipos de cuantización | Una única cuantización propietaria "zraldv1-ac" en GGUF (17,08 GiB / 18,34 GB); el autor remite a un repositorio maestro con tablas comparativas frente a Q8_0, Q6_K, Q5_K, Q4_K y Q2_K |
| Idiomas soportados | No disponible (los metadatos de HuggingFace no listan idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `zraldv1-ac.gguf`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura del modelo base (si es un transformer decoder-only denso, un MoE o una arquitectura híbrida), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo único que se puede afirmar con certeza es que se trata de una conversión a GGUF del modelo Qwen/Qwen3.8-27B, ejecutable con llama.cpp y compatible con el tokenizador y las plantillas de chat de la familia Qwen: los ejemplos de la ficha emplean el formato `<|im_start|>user ... <|im_end|>` con rol de sistema y asistente.

La innovación técnica declarada no está en la arquitectura sino en el proceso de cuantización: el autor afirma haber realizado un benchmark físico del fichero sobre AMD Instinct MI300X y etiqueta esta variante como "Accuracy Priority Tier", con una retención de precisión del 99,68 % y un ahorro de VRAM de unos 10 GB frente a cuantizaciones de mayor precisión (Q6_K/Q8_0). Los tags del repositorio incluyen `imatrix`, lo que sugiere el uso de calibración con matrices de importancia durante la cuantización, pero la ficha no detalla el método exacto, el número de bits por peso ni la composición del conjunto de calibración.

## Capacidades

- Generación de texto: tarea principal declarada en el pipeline (`text-generation`).
- Conversación multi-turno: la ficha incluye un modo interactivo (`llama-cli -cnv`) y etiquetas `conversational`.
- Generación de código: la etiqueta `coding` aparece entre las declaradas por el autor; no hay datos sobre lenguajes concretos ni benchmarks tipo HumanEval.
- Razonamiento: etiqueta `reasoning` declarada; el ejemplo de la ficha pide resolver "15 * 14 paso a paso", lo que apunta a soporte de razonamiento paso a paso, aunque sin datos de evaluación.
- Modo "thinking" explícito: no disponible.
- Tool calling / function calling: no disponible; la ficha no lo menciona ni documenta formato de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible más allá de la etiqueta genérica `reasoning`.
- Capacidades multilingües: no disponible (sin listado de idiomas).
- Visión, audio u otras modalidades: no disponibles; el repositorio es exclusivamente de generación de texto.
- Integración en servidor compatible con OpenAI: documentada mediante `llama-server` en el puerto 8080 (el repositorio incluye la etiqueta `endpoints_compatible`).

## Casos de uso

- Inferencia local en estación de trabajo con GPU de 24 GB: gracias al fichero de 18,34 GB y al mínimo de 20 GB de VRAM indicado por el autor, el modelo se puede cargar completo en una RTX 3090 o RTX 4090 mediante `llama-cli -ngl 99`, manteniendo contexto moderado y sin depender de servicios en la nube.
- Asistente de razonamiento matemático básico: el ejemplo de la ficha resuelve operaciones paso a paso, por lo que encaja en herramientas de apoyo educativo donde se requiere mostrar el procedimiento, no solo el resultado.
- Generación de código asistida en editor local: el modelo se puede exponer con `llama-server` y consumirse desde extensiones que hablan el protocolo de OpenAI, evitando enviar código propietario a APIs externas.
- Chat conversacional con contexto medio: los ejemplos documentan ventanas de 8.192 tokens en modo conversación, suficientes para sesiones de soporte o tutoría de varios turnos.
- Servicio interno de API compatible con OpenAI: `llama-server` en `0.0.0.0:8080` permite sustituir un endpoint remoto por uno local en herramientas ya integradas, útil para entornos con requisitos de soberanía del dato.
- Prototipado de pipelines de generación de texto sobre hardware AMD Instinct: el autor ha medido 1.344,4 tokens/s de prompt processing y 69,4 tokens/s de generación en MI300X, lo que sirve como referencia para dimensionar lotes en inferencia por GPU AMD.
- Evaluación comparativa de cuantizaciones: el repositorio maestro con tablas frente a Q8_0, Q6_K, Q5_K, Q4_K y Q2_K está pensado como material de comparación para elegir el equilibrio entre precisión y VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo. La model card únicamente aporta indicadores de rendimiento medidos por el propio autor, sin especificar el conjunto de evaluación empleado ni la referencia exacta contra la que se calcula la retención de precisión:

| Métrica | Valor declarado | Condiciones |
|---|---|---|
| Retención de precisión | 99,68 % | Referencia no especificada; comparada por el autor con Q6_K y Q8_0 |
| Throughput de procesamiento de prompt | 1.344,4 tok/s | AMD Instinct MI300X; parámetros de ejecución no detallados |
| Velocidad de generación | 69,4 tok/s | AMD Instinct MI300X; parámetros de ejecución no detallados |
| Tamaño físico del fichero | 17,08 GiB (18,34 GB) | Cuantización GGUF `zraldv1-ac` |
| VRAM mínima recomendada | 20 GB | Indicada por el autor |

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: mínimo recomendado de 20 GB según el autor, para un fichero de 17,08 GiB; hay que sumar la caché KV del contexto configurado (`-c 4096`, `8192` o `16384` en los ejemplos).
- GPU recomendadas: AMD Instinct MI300X es la única GPU con mediciones publicadas en la ficha. Como alternativa por capacidad de memoria, cualquier GPU con 24 GB o más (RTX 3090, RTX 4090, A10G de 24 GB, L4 de 24 GB en configuraciones holgadas, A100 40/80 GB, H100).
- ¿Cabe en GPU de consumo? Sí en tarjetas de 24 GB (RTX 3090, RTX 4090, y modelos equivalentes), cargando todas las capas en GPU con `-ngl 99` y sin contexto muy agresivo. En GPU de 16 GB o menos no cabe completo según el mínimo declarado de 20 GB; requeriría descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp es el runtime documentado explícitamente (`llama-cli` para prompt único e interactivo, `llama-server` para API compatible con OpenAI). El autor no menciona vLLM, TGI, Ollama ni LM Studio; al ser un fichero GGUF, otros runtimes compatibles con GGUF podrían funcionar, pero no está confirmado en la documentación disponible.
- Latencia y throughput: 69,4 tokens/s de generación y 1.344,4 tokens/s de procesamiento de prompt en AMD Instinct MI300X. No hay mediciones para GPUs de consumo ni para CPU.

## Comparativa con modelos similares

La información disponible no permite una comparativa rigurosa: no hay datos públicos verificables del modelo base ni de las cuantizaciones de referencia. La siguiente tabla recoge únicamente lo que el autor menciona, marcando como "no disponible" todo aquello que no se documenta.

| Modelo / variante | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zrald-AI Qwen 3.8 27B (zraldv1-ac) | 27,3 mil millones | No disponible | 99,68 % de retención de precisión; 69,4 tok/s de generación en MI300X (datos del autor) | apache-2.0 | Publicado en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,3 mil millones (según el repositorio derivado) | No disponible | No disponible | Apache 2.0 (según la model card derivada) | Referenciado como modelo base; sin documentación localizada en la búsqueda web |
| Cuantizaciones Q8_0, Q6_K, Q5_K, Q4_K, Q2_K del mismo modelo | No disponible | No disponible | El autor afirma que zraldv1-ac iguala o supera a Q6_K y Q8_0 en precisión, con ~10 GB menos de VRAM | No disponible | Referenciadas en el repositorio maestro del autor |

## Limitaciones y advertencias

- Ausencia total de validación independiente: 0 descargas y 0 "likes" en el momento de la consulta, y una única fuente (el propio autor) para todas las cifras de rendimiento.
- El modelo base Qwen/Qwen3.8-27B no aparece documentado en la búsqueda web realizada; conviene verificar su existencia, su licencia real y sus características antes de usarlo en producción.
- Metadatos poco fiables: la fecha de creación del repositorio (2026-09-18) figura como futura respecto a la información de referencia, lo que sugiere un artefacto de prueba o metadatos incorrectos.
- La arquitectura, el contexto máximo nativo y los idiomas soportados no están documentados, por lo que no se puede garantizar un comportamiento multilingüe ni un contexto superior a los 16.384 tokens que aparecen en los ejemplos.
- Riesgo de alucinación: inherente a cualquier modelo generativo; la ficha no aporta tasas de error ni evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgos ni de seguridad.
- La retención de precisión del 99,68 % no especifica el benchmark ni el conjunto de referencia, por lo que no es una cifra reproducible tal y como se presenta.
- Restricciones de licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial, pero el modelo base está identificado como propiedad de Qwen Team (Alibaba) y la licencia efectiva depende de la del modelo original, no verificada aquí.
- Soporte de tool calling, agentes y function calling no documentado: no conviene asumir su disponibilidad sin probarlo.
- No hay datos de rendimiento en GPU de consumo ni en CPU; las cifras de tokens/s corresponden exclusivamente a AMD Instinct MI300X y no son extrapolables.
- La cuantización es única y propietaria ("zraldv1-ac"), sin número de bits declarado ni método de calibración detallado, lo que dificulta auditar su reproducibilidad.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Zrald/Zrald-AI-qwen-3.8-27b-zraldv1-ac
- Repositorio maestro de cuantizaciones del autor: https://huggingface.co/Zrald/Zrald-AI-model-quant-qwen-3.8-27b
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (runtime documentado en la ficha): https://github.com/ggerganov/llama.cpp
- Nota: la búsqueda web realizada no devolvió ningún enlace relacionado con el modelo; los resultados obtenidos corresponden al estudio educativo PIRLS 2021 y no se incluyen por no ser relevantes.
