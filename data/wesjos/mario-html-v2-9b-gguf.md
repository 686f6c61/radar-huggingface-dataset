# wesjos/mario-html-v2-9B-GGUF

## Resumen

Mario-HTML-v2-9B-GGUF es la distribución cuantizada en formato GGUF del modelo wesjos/mario-html-v2-9B, un modelo multimodal de 9B parámetros especializado en generar HTML estructurado a partir de texto y, opcionalmente, de una imagen. Lo publica el usuario wesjos bajo licencia Apache 2.0 y está pensado para su ejecución local mediante llama.cpp. Su particularidad no es la generación de HTML genérica, sino que el modelo emite un contrato de salida cerrado: un único elemento raíz (`<div class="ai-view">`) con componentes concretos (tarjetas, rejillas, métricas, steppers, callouts, tablas, bloques de código) verificados contra el `theme.css` de la WebUI que acompaña al repositorio hermano de 4B.

La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, con 32 capas (24 de atención lineal y 8 de atención completa, intervalo 4) y dimensión oculta de 4096, sobre una base Qwen/Qwen3.5-9B. El contexto nativo es de 262.144 tokens. El modelo se distribuye en tres ficheros: dos cuantizaciones de los pesos (Q8_0 y Q4_K_M) y un proyector de visión en BF16 necesario para la entrada de imágenes.

Es relevante ahora porque cubre un nicho poco atendido: la generación de interfaces web en HTML "listo para renderizar" sin prompt de sistema, con trazas de razonamiento limpias (sin etiquetas HTML dentro del `<think>`) y con entrada visual. La ficha de HuggingFace registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un modelo muy reciente y sin validación comunitaria amplia. Existe una discrepancia entre el recuento de parámetros de los safetensors (8.953.803.264) y el tamaño declarado de la base (9,65 B), que conviene tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer híbrido: 24 capas de atención lineal + 8 de atención completa, intervalo 4, hidden 4096, 32 capas) |
| Parametros totales | 8.953.803.264 según safetensors del repo; la model card declara una base de 9,65 B en bf16 (17,98 GiB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos; el ejemplo oficial de llama-server usa `-c 65536` |
| Tipos de cuantizacion | Q8_0 (8,87 GiB, near-lossless) y Q4_K_M (5,24 GiB); proyector de visión en BF16 (0,86 GiB) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 en su variante de generación condicional, combinando capas de atención lineal con capas de atención completa en proporción 3:1 (24 frente a 8, intervalo 4) y una dimensión oculta de 4096. Esta mezcla reduce el coste de la atención en contextos muy largos, lo que explica la ventana nativa de 262.144 tokens. Al ser un modelo de tipo image-text-to-text, incorpora un proyector multimodal (`mmproj-Qwen3.5-9B-BF16.gguf`) que traduce las representaciones visuales al espacio del modelo de lenguaje.

En cuanto al entrenamiento, la única información disponible es que se ajustó sobre el dataset `wesjos/mario-html-sft`, propiedad del mismo autor; no se detallan el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO. La innovación destacable documentada es la pureza de la cadena de pensamiento ("CoT purity"): en la v2 la traza `<think>` contiene texto plano de planificación sin etiquetas HTML, mientras que la respuesta final se emite con el marcado del contrato de salida. El modelo funciona sin prompt de sistema por defecto ("zero-system-prompt").

## Capacidades

- Generación de HTML a partir de texto: produce un único elemento raíz `<div class="ai-view">` con estructuras de resumen, tarjetas, rejillas de 2 y 3 columnas, grupos de métricas, steppers, callouts (info, warning, success, danger), badges, tablas modernas, listas de características y bloques de código.
- Generación de HTML a partir de texto más imagen (visual-question-answering), con el proyector de visión cargado mediante `--mmproj`.
- Razonamiento explícito mediante bloque `<think>` con planificación en texto plano, sin marcado HTML en la traza (característica "cot-purity" de la v2).
- Diseño visual y web: el modelo conoce y respeta un conjunto cerrado de clases CSS verificado contra `webui/static/theme.css`.
- Matemáticas paso a paso: el ejemplo de la model card resuelve una ecuación lineal mostrando la planificación y una solución renderizada con bloques de código y callout.
- Comparativas estructuradas: genera rejillas de dos tarjetas, tablas cara a cara, tiles de métricas y listados de "BEST FOR / RISK / OPS / TRADE-OFF".
- Funcionamiento sin prompt de sistema (zero-prompt nativo) con decodificación greedy.
- Idiomas: inglés y chino (en, zh).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Generación automática de páginas de resultados: el modelo convierte una consulta en texto en una vista HTML completa con tarjetas, métricas y tablas, lista para inyectar en una aplicación web sin post-procesado de marcado.
- Respuestas enriquecidas en asistentes y chatbots: al emitir siempre un contrato de salida cerrado, la interfaz puede renderizar la respuesta directamente y mantener un estilo coherente entre turnos, algo útil en atención al cliente o paneles internos.
- Explicaciones didácticas paso a paso: con la traza `<think>` separada del resultado, encaja en plataformas educativas que quieren mostrar el razonamiento y la solución final con formato (por ejemplo, resolución de ecuaciones o explicaciones científicas).
- Documentación técnica y comparativas de producto: la capacidad de generar rejillas comparativas y tablas cara a cara permite producir fichas de evaluación de tecnologías (por ejemplo, microservicios frente a monolito) con secciones de ventajas, riesgos y métricas.
- Accesibilidad y descripción de imágenes: gracias a la entrada visual y al proyector multimodal, puede recibir una fotografía y responder con una ficha estructurada (identificación, comparación con elementos similares, tabla de características).
- Prototipado rápido de maquetas HTML: un desarrollador puede describir en lenguaje natural el bloque que necesita y obtener marcado con clases ya definidas, reduciendo el trabajo de maquetación manual en herramientas internas.
- Despliegue local en entornos sin conectividad: al distribuirse en GGUF y funcionar con llama.cpp, permite generar vistas HTML en máquinas sin GPU de datacenter ni acceso a APIs externas.
- Motor de plantillas semántico en pipelines de CI: puede generar fragmentos HTML deterministas (decodificación greedy) para informes de build, siempre que se valide el contrato de salida antes de publicarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones específicas de generación HTML), y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada (cálculo a partir de los tamaños de fichero publicados, no confirmado por el autor): Q4_K_M ocupa 5,24 GiB y Q8_0 8,87 GiB; sumando el proyector de visión (0,86 GiB) y la caché KV, la inferencia completa requiere del orden de 7-9 GB en Q4_K_M y 11-13 GB en Q8_0 para contextos moderados.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q8_0 con contexto amplio; RTX 4070, RTX 3060 de 12 GB o RTX 4080 para Q4_K_M.
- Cabe en GPU de consumo: sí. Q4_K_M es la opción indicada para GPUs de 12 GB o superiores; Q8_0 requiere 16-24 GB.
- Para contextos cercanos a los 262.144 tokens nativos, la caché KV crece de forma notable y será necesario hardware profesional (A100, H100 o equivalentes con 40-80 GB).
- Opciones de despliegue: llama.cpp, con los comandos documentados `llama serve -hf wesjos/mario-html-v2-9B-GGUF:Q8_0` o `llama-server -m Qwen3.5-9B-HTML-v5-Q8_0.gguf --mmproj mmproj-Qwen3.5-9B-BF16.gguf -ngl 99 -c 65536`. El flag `-ngl 99` implica descarga completa de capas en GPU. No se documentan otros motores (vLLM, TGI, Ollama).
- Se incluye una WebUI en el repositorio hermano `wesjos/mario-html-v2-4B`; si se reutiliza su `config.json`, hay que corregir `model_path` para que apunte a la cuantización de 9B, y activar el toggle de CoT (el `enable_thinking` viene en `false` por defecto).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| wesjos/mario-html-v2-9B-GGUF (este) | 8,95 B (safetensors); base declarada 9,65 B | 262.144 | texto → HTML y texto + imagen → HTML | apache-2.0 | GGUF (Q8_0, Q4_K_M) + mmproj BF16 | Cuantización del modelo de 9B, sin benchmarks publicados |
| wesjos/mario-html-v2-9B | no disponible en la información | no disponible | no disponible | no disponible | safetensors (no confirmado) | Modelo base sin cuantizar del que procede este repo |
| wesjos/mario-html-v2-4B | 4 B (según el nombre y las referencias de la model card) | no disponible | no disponible | no disponible | no disponible | Repositorio hermano; aporta la WebUI y una cuantización de 4B que debe sustituirse por la de 9B en la configuración |
| Qwen/Qwen3.5-9B | 9,65 B en bf16 (17,98 GiB) | 262.144 | no especificado en la información | no disponible | no disponible | Base arquitectónica declarada; sin el ajuste específico de generación HTML |

No se dispone de datos de rendimiento comparativos, por lo que la comparación se limita a especificaciones estructurales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que respalden la calidad del HTML generado ni su fidelidad al prompt.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgos ni de seguridad.
- Riesgo de alucinación: no evaluado en la información disponible; como modelo generativo, puede producir contenido o datos inexactos dentro del marcado HTML.
- Restricción de idiomas: solo inglés y chino (en, zh). No hay soporte declarado de castellano, lo que puede degradar la calidad del texto generado en español aunque las clases CSS sean neutras.
- Licencia: el repositorio GGUF declara apache-2.0, pero la licencia del modelo base Qwen/Qwen3.5-9B no se especifica en la información proporcionada; conviene verificarla antes de un uso comercial.
- Discrepancia de parámetros: los safetensors indican 8.953.803.264 parámetros mientras la model card declara 9,65 B para la base. No se explica la diferencia.
- Inconsistencia de nombres: los ficheros GGUF se llaman `Qwen3.5-9B-HTML-v5-*.gguf` aunque el repositorio y el modelo base se denominan `mario-html-v2-9B`; es un riesgo de confusión al automatizar descargas.
- Contrato de salida cerrado: dos clases del ejemplo (`step-list` y `ai-view-header`) no están definidas en `theme.css` y se renderizan con estilo de bloque por defecto.
- La traza de razonamiento está oculta por defecto en la WebUI (`enable_thinking: false`), lo que puede dar la impresión de que el modelo no razona.
- El contexto de 65.536 tokens usado en el ejemplo oficial es muy inferior a los 262.144 nativos; no se documenta el comportamiento real a máxima longitud.
- Fecha de creación del repositorio: 16 de octubre de 2026, según los metadatos de HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wesjos/mario-html-v2-9B-GGUF
- Modelo base sin cuantizar: https://huggingface.co/wesjos/mario-html-v2-9B
- Repositorio hermano de 4B (incluye la WebUI): https://huggingface.co/wesjos/mario-html-v2-4B
- Modelo base arquitectónico: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de ajuste: wesjos/mario-html-sft (referenciado en la model card; URL no disponible en la información proporcionada)
- Ficheros: https://huggingface.co/wesjos/mario-html-v2-9B-GGUF/resolve/main/Qwen3.5-9B-HTML-v5-Q8_0.gguf · https://huggingface.co/wesjos/mario-html-v2-9B-GGUF/resolve/main/Qwen3.5-9B-HTML-v5-Q4_K_M.gguf · https://huggingface.co/wesjos/mario-html-v2-9B-GGUF/resolve/main/mmproj-Qwen3.5-9B-BF16.gguf
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su dataset.
