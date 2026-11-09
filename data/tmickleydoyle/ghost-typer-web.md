# tmickleydoyle/ghost-typer-web

## Resumen

ghost-typer-web es la compilación para navegador de ghost-typer, un sistema de autocompletado de texto (ghost text) orientado a prompts de programación. Lo desarrolla tmickleydoyle y se publica bajo licencia MIT. No es un transformer entrenado con descenso de gradiente: es un modelo compilado mediante reglas cerradas de forma analítica a partir de un corpus de texto, con un Kneser-Ney interpolado de 5-gramas y una neurona MLP por contexto. El resultado se ejecuta íntegramente en el dispositivo del usuario con un runtime TypeScript sin dependencias de aproximadamente 5 KB.

El artefacto principal, `model.bin`, ocupa 10,8 MB en cuantización uint8 (con una escala por longitud de contexto) y contiene 31.486 palabras y 520.483 contextos. La versión sin cuantizar `model-f32.bin` ocupa 17,0 MB en float32. Según la model card, la cuantización apenas altera los resultados: 90,23 % de precisión frente a 90,22 % en el conjunto de validación, y 22,29 % de pulsaciones ahorradas en ambos casos, medido sobre 1.711 prompts de validación escritos carácter a carácter.

Su relevancia radica en la propuesta de despliegue: autocompletado de baja latencia (2,6 ms de mediana y 4,8 ms en p95 por pulsación con Bun, y unos 360 ms de carga del fichero uint8 en Chrome) sin GPU, sin servidor y sin coste de inferencia en la nube. Es un hermano compilado del modelo denso `LlamaForCausalLM` de 396M parámetros del repositorio principal, no una cuantización de sus pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo compilado (no entrenado): Kneser-Ney interpolado de 5-gramas con una neurona MLP por contexto; runtime TypeScript sin dependencias |
| Parametros totales | No disponible en el artefacto de navegador; el modelo denso base tiene 396M parámetros (97 % ceros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 5 tokens (n-gramas de orden 5) |
| Tipos de cuantizacion | uint8 con una escala por longitud de contexto (`model.bin`); float32 sin cuantizar (`model-f32.bin`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Binario propio `GHST` v2 (`model.bin`, `model-f32.bin`); el modelo denso base usa `safetensors` |
| Vocabulario | 31.486 palabras (ajustes de navegador; el denso usa 6.000) |
| Contextos almacenados | 520.483 |
| Tamano del artefacto | 10,8 MB (uint8) / 17,0 MB (float32) |
| Libreria | `ghost-typer` |

## Arquitectura y entrenamiento

El modelo no se entrena con gradientes: se compila con reglas cerradas de forma a partir de un corpus de texto. La estructura subyacente es un modelo de lenguaje de n-gramas (Kneser-Ney interpolado de orden 5) en el que cada contexto se representa como una neurona MLP que escribe cambios de logit sobre la distribución del siguiente token. El artefacto de navegador conserva únicamente las partes no nulas: los tokens de contexto de cada neurona y los cambios de logit que aplica. El modelo denso del repositorio principal (`LlamaForCausalLM`, 396M parámetros, 97 % ceros) y esta compilación proceden del mismo texto y las mismas reglas, pero no son el mismo artefacto: la versión web usa un vocabulario de 31.486 palabras frente a 6.000 del denso, porque en el formato disperso las palabras adicionales apenas cuestan espacio.

El texto fuente son prompts escritos por humanos procedentes de WildChat-1M (ODC-BY), OpenAssistant oasst2 (Apache-2.0), MBPP (CC-BY-4.0) y CoNaLa (MIT), más unas 1.100 frases cotidianas escritas por un asistente de programación con IA (Claude). La cuantización uint8 aplica una escala por longitud de contexto y se valida con una comprobación de exactitud: el runtime reproduce la distribución del siguiente token de PyTorch dentro de 1e-3 nats cuando se le dan las tablas del modelo denso (test incluido en el repositorio fuente).

## Capacidades

- Autocompletado de texto tipo ghost text para campos de entrada y editores, con umbral de confianza configurable (τ por defecto 0,71; τ = 0,9 ofrece aproximadamente 96 % de precisión y 15,8 % de pulsaciones ahorradas).
- Predicción del siguiente fragmento de texto a partir de un contexto de hasta 5 tokens, orientada a prompts de programación y frases de uso cotidiano.
- Gestión explícita de tokens fuera de vocabulario mediante una tabla `oov_keys`/`oov_vals` que estima P(fuera de vocabulario | prefijo).
- Ejecución íntegra en el dispositivo, en navegador, sin llamadas a servidor ni dependencias externas.
- API TypeScript: `CompiledAutocomplete.load(url)` y `ac.suggest(text, opciones)` devuelven `{ ghost, prob }`, con cadena vacía cuando no hay confianza suficiente.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento. El soporte multilingüe se limita al inglés.

## Casos de uso

- Autocompletado en editores de código basados en web: el runtime se integra en un `input` o editor y muestra texto fantasma que se acepta con Tab, con 2,6 ms de mediana por pulsación, adecuado para interfaces interactivas sin backend.
- Asistentes de escritura en aplicaciones de productividad: dado que el modelo se carga en unos 360 ms en Chrome y ocupa 10,8 MB, puede empaquetarse con la aplicación y funcionar sin conexión.
- Herramientas de formación y demos de programación: la demo pública y el formato `GHST` v2 documentado permiten inspeccionar cómo se construye la predicción y usarlo como material didáctico sobre n-gramas y compilación de modelos.
- Extensiones de navegador para autocompletar formularios y consultas: el modelo prioriza prompts de programación y frases cotidianas, por lo que encaja en campos de búsqueda técnica o de instrucciones.
- Prototipado de interfaces de autocompletado sin infraestructura: permite validar la experiencia de usuario de ghost text antes de invertir en un modelo generativo servido, usando la misma API y cambiando después de backend.
- Aplicaciones con requisitos estrictos de privacidad: al no enviar texto a ningún servidor, el contenido tecleado por el usuario permanece en el dispositivo, lo que facilita el cumplimiento en entornos regulados.
- Pruebas de regresión de precisión: el par uint8/float32 y la comprobación de exactitud frente a PyTorch permiten verificar que una integración reproduce los resultados esperados.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de autocompletado, no benchmarks estándar de LLM (MMLU, HumanEval, GSM8K no están disponibles).

| Metrica | model.bin (uint8) | model-f32.bin (float32) |
|---|---|---|
| Precisión en validación | 90,2 % | 90,2 % |
| Pulsaciones ahorradas | 22,3 % | 22,3 % |
| Tamano | 10,8 MB | 17,0 MB |
| Latencia por pulsación (mediana, Bun) | 2,6 ms | No disponible |
| Latencia por pulsación (p95, Bun) | 4,8 ms | No disponible |
| Tiempo de carga (Chrome) | ~360 ms | No disponible |

Precisión y pulsaciones ahorradas se midieron escribiendo 1.711 prompts de validación carácter a carácter. Con τ = 0,9 la precisión sube a ~96 % y las pulsaciones ahorradas bajan a 15,8 %. La cuantización altera la precisión en +0,01 puntos (90,23 % frente a 90,22 %).

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU dentro del navegador.
- Memoria: el fichero uint8 ocupa 10,8 MB y el float32 17,0 MB; el runtime ESM empaquetado pesa ~5 KB.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica; funciona en cualquier dispositivo capaz de ejecutar JavaScript/TypeScript moderno.
- Despliegue: runtime `ghost-typer.js` (ESM) o fuentes en `src/`; carga del modelo desde Hugging Face o servido localmente con `python3 -m http.server`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer servible por esas herramientas.
- Latencia: 2,6 ms de mediana y 4,8 ms en p95 por pulsación (Bun); ~360 ms de carga del fichero uint8 en Chrome.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia interna de la misma familia:

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| ghost-typer-web (`model.bin`) | No disponible (denso base: 396M, 97 % ceros) | 5 tokens | `GHST` v2 uint8 | MIT | Autocompletado en navegador |
| ghost-typer (repo principal) | 396M | 5 tokens | `safetensors` (float32) | MIT | Referencia y compilación |
| Alternativas de la categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Contexto muy corto (5 tokens): no puede aprovechar contexto conversacional largo ni mantener coherencia más allá de la frase inmediata.
- Solo inglés: no hay soporte documentado de otros idiomas.
- Es un modelo compilado de n-gramas, no un LLM generativo: no razona, no sigue instrucciones complejas y no genera código estructurado más allá de continuaciones locales.
- Riesgo de sugerencias incorrectas: la precisión del 90,2 % implica que aproximadamente una de cada diez sugerencias es incorrecta; el umbral τ permite ajustar el equilibrio entre precisión y cobertura.
- Sesgos: el corpus de origen (WildChat-1M, oasst2, MBPP, CoNaLa y frases de un asistente de IA) puede introducir sesgos de dominio y de estilo; no se documenta una evaluación de sesgos.
- Licencia MIT: permite uso comercial, pero debe conservarse la atribución de las fuentes de datos indicada en `data/SOURCES.md` del repositorio principal.
- El artefacto de navegador no es una cuantización de `model.safetensors`; no debe tratarse como sustituto intercambiable del modelo denso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmickleydoyle/ghost-typer-web
- Modelo base (denso): https://huggingface.co/tmickleydoyle/ghost-typer
- Demo: https://tmickleydoyle.github.io/ghost-typer/
- Repositorio del compilador, tests y benchmarks: https://github.com/tmickleydoyle/ghost-typer
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Dataset CoNaLa: https://huggingface.co/datasets/neulab/conala
