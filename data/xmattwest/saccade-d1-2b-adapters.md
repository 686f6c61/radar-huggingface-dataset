# xmattwest/saccade-d1-2b-adapters

## Resumen

Saccade v2.0 Adapters es un conjunto de seis adaptadores LoRA de rango 8 (alpha = 16,0) en FP16 que se montan sobre el modelo base LiquidAI/d1-2B (familia LFM3 de Liquid AI) para construir una capa local de "reflejos de navegador" orientada a agentes de programación. El autor es xmattwest y el paquete se distribuye bajo licencia MIT en formato MLX, pensado para ejecutarse en Apple Silicon. El problema que aborda es el coste en tokens y latencia de enviar entre 3.000 y 6.000 tokens de DOM crudo a un modelo frontera en la nube en cada clic; Saccade resuelve tareas de elección de referencia, extracción estructurada, seguridad pre-CDP y verificación post-acción en local con un total de 96 MB de adaptadores sobre un backbone cuantizado a 4 bits.

El modelo base d1-2B es un transformer híbrido de 24 capas que combina convolución y atención, con aproximadamente 2.000 millones de parámetros; los adaptadores cubren todas esas capas en las proyecciones q_proj, k_proj, v_proj, o_proj, in_proj, out_proj, w1, w2 y w3. La suite no es un modelo generativo de propósito general: es un conjunto de cabezas especializadas (Choice y Noul) para tareas acotadas de interacción web, con un adaptador causal para síntesis de QuickJS.

Su relevancia actual radica en que permite a agentes MCP (Claude Code, Codex, Cursor, OpenCode, Antigravity y más de 30 clientes) delegar decisiones de clic, detección de acciones destructivas y filtrado de inyección de prompt en un componente local de 1,00 GiB de RAM activa, reduciendo el consumo de tokens en la nube hasta un 69,2 % en un flujo medido y un 70,6 % en una suite de 20 flujos de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido convolución-atención (LFM3) con adaptadores LoRA de rango 8 sobre el modelo base |
| Parametros totales | No disponible para los adaptadores (96 MB en disco); modelo base d1-2B de aproximadamente 2B parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone en MLX 4-bit; adaptadores en FP16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | MLX (adaptadores LoRA); modelo base LiquidAI/d1-2B-MLX-4bit |
| Tamano del repositorio | 0,1 GB |
| Latencia de intercambio en caliente | 0,17 ms de media |
| RAM activa | 1,00 GiB (DOM), 1,35 GiB (con visión), 0,00 GiB en reposo |
| Hardware objetivo | Apple Silicon (M1 en adelante) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El backbone LiquidAI/d1-2B es un transformer híbrido de 24 capas que alterna convolución y atención, sobre el que se aplican adaptadores LoRA de rango 8 y alpha 16,0 en FP16. Cada adaptador se entrena sobre tareas concretas con cabezas específicas: `d1_reflex_v2` usa una cabeza conjunta `Choice` más dos cabezas `Noul` para decidir referencia, destructividad e inyección en una sola pasada; `d1_som_grounder` emplea una cabeza `Choice` sobre marcas visuales [1]..[12] para localizar iconos en canvas y SVG sin etiquetar; `d1_pointer_etl` implementa un puntero de span sin generación de tokens con abstención nula BOS0; `d1_handoff_guard` es un firewall de dos ranuras previo a CDP; `d1_aftermath_tm` clasifica transiciones de estado en cuatro clases a partir de recortes before/after y diferencias ARIA; y `d1_quickjs_etl` usa generación causal (CausalD1View) para sintetizar QuickJS y JSON anidado.

Los datos de entrenamiento provienen de McGill-NLP/WebLINX, instantáneas de Headless Chrome mediante capture.js, deepset/prompt-injections, mlfoundations/Click-100k, rajpurkar/squad_v2, tarjetas SaaS multicampo de Chrome y JSONSchemaBench, con volúmenes de 900 a 1.500 ejemplos por adaptador. No se documenta en la información disponible el número total de tokens de entrenamiento del backbone ni si hubo RLHF o DPO. La innovación destacable es la ejecución de seis adaptadores sobre un único backbone cuantizado con intercambio en caliente de 0,17 ms, junto con el uso de set-of-marks para evitar la regresión de coordenadas de caja (que pasa de 20,67 % a 87,67 % en ScreenSpot).

## Capacidades

- Elección de referencia DOM en una sola pasada: selecciona el elemento a clicar a partir de una instantánea ARIA y un subobjetivo, con una tasa Top-1 del 76,07 %.
- Detección conjunta de acciones destructivas y de inyección de prompt antes de despachar la acción por CDP.
- Localización visual de UI mediante set-of-marks sobre iconos en canvas y SVG sin etiqueta, con 87,67 % en ScreenSpot.
- Extracción estructurada sin generación de tokens: punteros de span para texto, número y fecha, con abstención nula (97,03 % de precisión en abstención BOS0).
- Firewall de middleware previo a CDP para llamadas directas de click, fill y eval, con AUROC de 1,0000.
- Clasificación de estado post-acción en cuatro clases (advanced, validation_error, noop, loading) con 100 % de precisión.
- Síntesis causal de QuickJS y JSON anidado con referencias ARIA válidas.
- Soporte de tool calling y de agentes MCP a través de la capa Rust browse.
- Capacidades multilingües: solo inglés.
- Capacidad de visión para el adaptador de grounding visual (pipeline image-text-to-text).

## Casos de uso

- Automatización de navegación para agentes de programación: el agente delega en Saccade la elección de referencia y la comprobación de seguridad antes de cada clic, reduciendo de 3.396 a 1.046 tokens en la nube en el flujo medido y acortando el tiempo de 25,01 s a 13,16 s.
- Protección frente a inyección de prompt en tickets de soporte: el adaptador `d1_handoff_guard` bloquea acciones inyectadas antes de que lleguen a CDP, con 100 % de recall y 0 % de falsos positivos sobre acciones benignas.
- Prevención de acciones destructivas en producción: el firewall de dos ranuras detecta borrados de repositorio y resets peligrosos, permitiendo explícitamente los resets de QA en localhost con una tasa de permitidos del 100 %.
- Relleno de formularios SaaS multicampo: el adaptador `d1_pointer_etl` extrae campos de texto, número y fecha con punteros de span sin generar tokens, logrando 100 % de exactitud en tarjetas de cuatro campos y 482 ms en vivo.
- Grounding de iconos de barra de herramientas sin etiqueta: el adaptador `d1_som_grounder` identifica el icono correcto entre 12 marcas visuales, útil en paneles de administración con SVG no accesibles.
- Verificación de resultados tras una acción: `d1_aftermath_tm` clasifica si la acción avanzó, produjo error de validación, no tuvo efecto o quedó cargando, lo que permite reintentos automáticos fiables.
- Generación de scripts QuickJS para automatización: `d1_quickjs_etl` sintetiza código de múltiples pasos y JSON anidado con referencias ARIA válidas, sin alucinar referencias eXX.
- Despliegue en portátiles Apple Silicon: la suite completa cabe en 1,00 GiB de RAM activa y 96 MB en disco, lo que permite ejecutar agentes de navegador sin GPU dedicada ni conexión a modelos en la nube para las decisiones locales.

## Benchmarks y rendimiento

| Adaptador | Tarea | Resultado en test retenido |
|---|---|---|
| `d1_reflex_v2` | Elección conjunta pick/destructive/injection | 76,07 % Top-1; 83,46 % en el slice M4; 66,67 % de cobertura a >= 90 % de precisión (+25,0 pp sobre zero-shot); AUROC de firewall 1,0000 |
| `d1_som_grounder` | Grounding visual set-of-marks | 87,67 % en 300 imágenes ScreenSpot; 85,0 % en Apple M4 a 4 bits (+67,0 pp frente a coordenadas Box) |
| `d1_pointer_etl` | Puntero de span y abstención nula | 97,03 % de abstención BOS0 (+6,9 pp); 100,0 % de exactitud en tarjeta SaaS multicampo |
| `d1_handoff_guard` | Firewall destructivo e inyección | AUROC 1,0000; 100,0 % de recall en click/fill/eval directos |
| `d1_aftermath_tm` | Clasificación de transición de estado | 100,0 % en 4 clases |
| `d1_quickjs_etl` | Síntesis QuickJS y JSON anidado | 100,0 % de sintaxis y validez ARIA; 0 referencias eXX alucinadas |

Mediciones en vivo frente a Chrome headless por CDP: tiempo de 25,01 s a 13,16 s (1,90x más rápido) y 1,43x más rápido que Saccade v1.0; tokens en la nube de 3.396 a 1.046 (-69,2 %) y de 122.627 a 36.058 (-70,6 %) en una suite de 20 flujos; 2 de 2 acciones destructivas e inyectadas bloqueadas antes de CDP (0 mutaciones de DOM frente a 2 ejecutadas en stock); 100 % de resets de QA en localhost permitidos (p = 0,0000); scrubbing del 100 % de correos, SSN, tarjetas y claves API salientes en 254 us.

## Requisitos de hardware

- RAM activa: 1,00 GiB para tareas de DOM; 1,35 GiB cuando se carga la ruta de visión; 0,00 GiB en reposo.
- Almacenamiento: 96 MB para los seis adaptadores; el backbone LiquidAI/d1-2B-MLX-4bit se descarga en el primer arranque.
- Hardware objetivo: Apple Silicon, de M1 en adelante; el autor reporta resultados a 4 bits en Apple M4.
- No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Despliegue: biblioteca MLX, servicio sidecar en Python (`SaccadeSidecarService`) y relay nativo en Rust (`browse`) compilado con Cargo.
- Latencia: intercambio en caliente de adaptadores de 0,17 ms; llamada `act_and_guard` de aproximadamente 600 ms; extracción multicampo en vivo de 482 ms.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saccade v2.0 Adapters (d1-2B) | Adaptadores de 96 MB sobre backbone de ~2B | No disponible | Reflejos de navegador locales para agentes | MIT | Hugging Face y GitHub |
| Saccade v1.0 | No disponible | No disponible | Dos pasadas para las mismas tareas | MIT | GitHub del autor |
| LiquidAI/d1-2B (base) | ~2B | No disponible | Modelo base híbrido convolución-atención | No disponible | Hugging Face |
| Modelo frontera en la nube (referencia stock) | No disponible | No disponible | Navegación con DOM crudo en la nube | Propietaria | API |

La comparación cuantitativa disponible se limita a Saccade v1.0 (1,43x más rápido en tiempo de reloj) y al flujo stock con modelo frontera (1,90x más rápido y -69,2 % de tokens). No se dispone de datos de benchmarks frente a otros modelos de grounding de UI en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documentan capacidades en castellano ni en otros idiomas.
- Optimizado exclusivamente para Apple Silicon; no hay evidencia de funcionamiento en GPU NVIDIA ni en CPU x86.
- Las tareas son acotadas: elección de referencia, extracción de spans, clasificación de estado y síntesis de QuickJS; no es un modelo de propósito general.
- Los resultados de grounding visual bajan del 87,67 % al 85,0 % en cuantización de 4 bits en Apple M4.
- La cobertura de `d1_reflex_v2` a >= 90 % de precisión es del 66,67 %, lo que implica que un tercio de los casos queda fuera del umbral de alta precisión.
- Riesgo de alucinación en la generación de QuickJS y JSON, mitigado pero no eliminado por la validación de referencias ARIA.
- No se documentan sesgos conocidos ni evaluación de robustez frente a dominios web no vistos.
- La licencia MIT permite uso comercial, pero el modelo base LiquidAI/d1-2B tiene su propia licencia, no especificada en la información disponible, que debe verificarse por separado.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación de la comunidad ni informes independientes de producción.
- Depende de la capa Rust `browse` y del servicio sidecar; la integración con más de 30 clientes MCP no está verificada de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/xmattwest/saccade-d1-2b-adapters
- Descripción general y benchmarks: https://shelltoho.me/tools/saccade/
- Código fuente y relay Rust (MIT): https://github.com/xmattwest/saccade
- Estudio de arquitectura (Inside LFM3): https://shelltoho.me/pubs/inside-lfm3/
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Dataset WebLINX: https://huggingface.co/datasets/McGill-NLP/WebLINX
- Dataset Click-100k: https://huggingface.co/datasets/mlfoundations/Click-100k
- Dataset SQuAD v2: https://huggingface.co/datasets/rajpurkar/squad_v2
- Dataset prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
