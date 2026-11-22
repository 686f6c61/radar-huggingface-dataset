# Thox-ai/ThoxScene-Key

## Resumen

ThoxScene-Key es un modelo de generación de texto especializado en la producción de escenas 3D interactivas mediante código Three.js. Lo desarrolla Thox-ai, un proyecto que comercializa un ecosistema de dispositivos de IA privada, y se deriva por fine-tuning de `ccore/Qwen3.5-4B-3D-Coder`, que a su vez es un ajuste de `Qwen/Qwen3.5-4B`. El modelo resuelve un problema muy concreto: traducir una descripción en lenguaje natural a un único archivo HTML autocontenido que renderiza una escena tridimensional navegable, algo que los modelos base rara vez logran con consistencia.

La relevancia de esta ficha no está tanto en el modelo como en su enfoque de publicación: ThoxScene-Key es la variante "host-tier" de la familia ThoxScene, es decir, comparte exactamente los mismos pesos fusionados que ThoxScene-4B pero se distribuye en cuantizaciones de mayor precisión (Q8_0 y Q5_K_M) pensadas para equipos anfitriones con más memoria disponible. El modelo tiene 4.205.751.296 parámetros, licencia Apache-2.0 y está entrenado exclusivamente en inglés.

Conviene señalar desde el principio que el propio autor documenta el resultado como "baseline documentado": el ajuste supera ampliamente a la base en la métrica principal (70,8 % de escenas renderizables frente a 20,8 %), pero no alcanza los umbrales de promoción pre-registrados del programa. Es, por tanto, un modelo útil y funcional, pero presentado con una honestidad poco habitual sobre sus límites.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (identificador `qwen3_5`), transformer con torre de visión |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens empaquetados por defecto; ampliable por encima para escenas largas (hasta 16K tokens de salida recomendados) |
| Tipos de cuantizacion | GGUF Q5_K_M (3.074.986.784 B) y Q8_0 (4.482.403.104 B); safetensors FP16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16) y GGUF (Q5_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura Qwen3.5 de 4B parámetros con torre de visión, heredada de `ccore/Qwen3.5-4B-3D-Coder`. Sobre esa base, Thox-ai aplicó un fine-tuning mediante LoRA de rango 64 y alpha 128 sobre todas las capas lineales, manteniendo congelada la torre de visión, y posteriormente fusionó los adaptadores en los pesos finales. El resultado es el snapshot denominado `v2-lora-r64`, que es el que se publica tanto aquí como en ThoxScene-4B.

El corpus de entrenamiento es el ThoxScene corpus, compuesto por 1.348 filas validadas por renderizado, es decir, ejemplos filtrados según si el HTML generado producía efectivamente una escena Three.js funcional. El autor documenta dos intentos de entrenamiento: el LoRA fusionado (`v2-lora-r64`) y un fine-tuning completo (`v2-full-ft1`) que rindió claramente peor (33,3 % de escenas renderizables frente al 70,8 % del LoRA). Un detalle técnico relevante es el "contrato de servicio": el modelo está entrenado para operar con el modo de razonamiento (thinking) desactivado, ya que el preámbulo de razonamiento del modelo base desplaza la salida directa de escena que el ajuste busca producir. La configuración recomendada es temperatura 0,7, top-p 0,95, top-k 20 y penalización de repetición 1,0, con system prompt fijado a Three.js r160.

## Capacidades

- Generación de código HTML/JavaScript autocontenido que renderiza escenas Three.js interactivas a partir de una descripción en lenguaje natural.
- Generación de código especializado en 3D: geometrías, materiales, iluminación, cámaras y controles de órbita.
- Escenas de tipo showcase de producto, diagramas de datos, dioramas educativos, interiores, mecanismos y escenas voxel.
- Iteración sobre escenas existentes dentro de una conversación multi-turno (modelo marcado como `conversational`).
- Capacidad de visión heredada del modelo base, aunque la torre quedó congelada durante el ajuste y no se documenta su uso en esta variante.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; de hecho, el modo thinking debe desactivarse.
- Multilingüismo: limitado al inglés.

## Casos de uso

- Prototipado rápido de escenas 3D: un diseñador describe una escena ("una habitación con una mesa y luz cálida desde la ventana") y obtiene un HTML listo para abrir en el navegador, eliminando la escritura manual de boilerplate de Three.js.
- Showcase de producto en webs comerciales: generar visores 3D interactivos de un dispositivo o producto para incrustar en una página, usando la cuantización Q8_0 en un equipo anfitrión donde la fidelidad del código generado importa más que el tamaño.
- Visualización de datos en 3D: producir gráficos y diagramas tridimensionales (MeshStack, según el autor) a partir de una especificación textual, útiles en paneles analíticos o presentaciones.
- Material educativo interactivo: crear dioramas y modelos explicativos (sistema solar, anatomía simplificada, mecanismos) que los estudiantes puedan rotar y explorar en el navegador.
- Diseño de interiores y previsualización espacial: generar configuraciones de mobiliario y distribución con iluminación y cámara configurables para validar ideas antes de pasar a herramientas CAD.
- Iteración asistida en estudio de diseño: mantener una conversación multi-turno para refinar una escena (cambiar materiales, añadir objetos, ajustar la cámara) sin reescribir el archivo desde cero.
- Generación de escenas voxel y prototipos de videojuego a pequeña escala: útil para maquetas y pruebas de concepto, no para mundos a escala de juego.

## Benchmarks y rendimiento

Evaluación held-out sobre 24 prompts con arnés de renderizado (pesos idénticos a ThoxScene-4B):

| Metrica | Base upstream | `v2-lora-r64` (publicado) | `v2-full-ft1` |
|---|---|---|---|
| Escenas renderizables (render-valid) | 20,8 % | 70,8 % (17/24) | 33,3 % |
| Sintaxis válida | no disponible | 91,7 % | 79,2 % |
| Truncamiento | no disponible | 4,2 % | 12,5 % |
| Clase THOX | no disponible | 5/6 | 2/6 |
| Adherencia (adherence) | no disponible | 9/16 | 5/16 |

Los umbrales de promoción pre-registrados del programa (≥80 % render-valid, ≥95 % sintaxis, ≤10 % truncamiento) no se alcanzaron con el build publicado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en FP16, en torno a 8,4 GB solo para pesos, más overhead de contexto; en Q8_0, aproximadamente 4,5 GB de pesos; en Q5_K_M, unos 3,1 GB.
- GPU recomendadas: al ser un modelo de 4B, cabe con holgura en RTX 4090 (24 GB), RTX 4080/4070 Ti y similares; en FP16 requiere GPU de 16 GB o más (A100, H100, RTX 4090, RTX A4000 de 16 GB).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q5_K_M o Q8_0.
- Opciones de despliegue: llama.cpp (se requiere una build reciente con soporte Qwen3.5), LM Studio (desactivando MTP para esta familia), Ollama (`ollama run Thox-ai/thoxscene-key` para Q5_K_M, `:q8_0` para Q8_0) y safetensors vía transformers.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda elevar `num_ctx` por encima de 8.192 para las escenas más largas y permitir hasta 16K tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxScene-Key | 4B | 8.192 (ampliable) | Generación de escenas Three.js, builds de alta precisión | Apache-2.0 | Hugging Face, Ollama |
| ThoxScene-4B | 4B | 8.192 (ampliable) | Mismos pesos, builds para dispositivo | Apache-2.0 | Hugging Face |
| ccore/Qwen3.5-4B-3D-Coder | 4B | no disponible | Base de código 3D sin ajuste específico de escenas | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |

La comparación relevante es interna a la familia: ThoxScene-Key y ThoxScene-4B comparten pesos y solo difieren en las cuantizaciones publicadas. Frente a la base `ccore/Qwen3.5-4B-3D-Coder`, la mejora medida en escenas renderizables es de 20,8 % a 70,8 %. No se dispone de datos para comparar con alternativas externas especializadas en generación de código Three.js.

## Limitaciones y advertencias

- El propio autor califica el modelo como "baseline documentado": no alcanza los umbrales de promoción de su programa (80 % render-valid, 95 % sintaxis, 10 % truncamiento).
- El 29,2 % de las escenas generadas en la evaluación no fueron renderizables, y el 8,3 % del código no era sintácticamente válido.
- El truncamiento afecta al 4,2 % de las salidas; las escenas complejas pueden requerir ampliar el contexto más allá de los 8.192 tokens empaquetados.
- El HTML/JavaScript generado es código no confiable: debe ejecutarse únicamente en un WebView aislado o iframe sin acceso a APIs privilegiadas, archivos locales ni credenciales.
- El modelo solo soporta inglés; no se documenta rendimiento en castellano ni en otros idiomas.
- El modo thinking debe desactivarse obligatoriamente; dejarlo activo degrada la salida porque el preámbulo de razonamiento desplaza la escena directa.
- Uso previsto restringido: no es adecuado para mundos a escala de juego, precisión de nivel CAD ni generación de código para contextos de ejecución privilegiados.
- La torre de visión quedó congelada durante el ajuste y no se documenta su funcionamiento en esta variante.
- El repositorio incluye material promocional de una campaña de Kickstarter, lo que conviene tener en cuenta al evaluar la independencia del proyecto.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre la corrección del código generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxScene-Key
- Modelo hermano ThoxScene-4B: https://huggingface.co/Thox-ai/ThoxScene-4B
- Modelo base intermedio: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización en Hugging Face: https://huggingface.co/Thox-ai
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
