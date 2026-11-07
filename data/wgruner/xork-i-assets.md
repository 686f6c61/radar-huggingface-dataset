# wgruner/xork-i-assets

## Resumen

Xork I assets es un repositorio de artefactos (no un modelo único) publicado por el desarrollador independiente wgruner para el proyecto Xork I, una reimplementación no comercial del clásico juego de ficción interactiva Zork I que incorpora ilustraciones de las habitaciones y diálogos de un personaje acompañante, todo ejecutado en local. El repositorio agrupa dos componentes diferenciados: un modelo de lenguaje afinado para generar las líneas del personaje Sybylla y un LoRA de estilo visual para el modelo de generación de imágenes FLUX.2 klein 4B.

El componente conversacional es un fine-tuning con LoRA del modelo NVIDIA Nemotron 3 Nano 4B, fusionado y cuantizado a Q4_K_M para su uso con llama.cpp. El componente visual es un LoRA de estilo para la configuración de imagen `best` del modelo de difusión FLUX.2 klein 4B. Ambos artefactos se distribuyen bajo licencias distintas (NVIDIA Open Model License para el LLM derivado y Apache 2.0 para el LoRA de imagen), y el propio proyecto se declara no comercial y sin afiliación con los titulares de la marca Zork.

El interés del repositorio es acotado: no es un modelo de propósito general sino un paquete de assets para una aplicación concreta, con cero descargas y cero likes en el momento de la consulta. Resulta relevante como ejemplo de empaquetado de modelos derivados (LoRA fusionado + cuantización GGUF) y de combinación de un LLM pequeño con un modelo de difusión en un flujo de juego interactivo local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el componente LLM deriva de NVIDIA Nemotron 3 Nano 4B; el componente visual es un LoRA sobre FLUX.2 klein 4B) |
| Parametros totales | 3.973.556.832 (según safetensors del repo); el LLM Sybylla se distribuye como GGUF Q4_K_M |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para el modelo de lenguaje; LoRA en safetensors para el modelo de imagen |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License (modelo Sybylla, derivado de Nemotron 3 Nano 4B); Apache 2.0 (LoRA trapdoor sobre FLUX.2 klein 4B); el repo se etiqueta como `license: other` |
| Formato de pesos | GGUF (LLM cuantizado), safetensors (LoRA de imagen), JSON (metadatos del LoRA) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de los modelos base. El componente de lenguaje es un fine-tuning mediante LoRA de NVIDIA Nemotron 3 Nano 4B, posteriormente fusionado con los pesos base y cuantizado a Q4_K_M para inferencia con llama.cpp. No se especifican en la model card el volumen de datos de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de alineación como RLHF o DPO. El LoRA de imagen (`trapdoor-style-klein4b-v1.safetensors`) se aplica sobre FLUX.2 klein 4B con un trigger y una fuerza definidos en el fichero `trapdoor.json`, orientado a la configuración de imagen `best`.

La innovación técnica destacable no está en los modelos en sí, sino en el empaquetado: se distribuyen checksums SHA-256 de cada artefacto, se separan claramente las licencias por componente y se ofrece un instalador ("Play Xork I") que descarga automáticamente los assets, de modo que el usuario final no manipula los ficheros directamente. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional para las líneas del personaje Sybylla en el contexto del juego Zork I.
- Generación de imágenes de las habitaciones mediante el LoRA de estilo sobre FLUX.2 klein 4B.
- Ejecución completamente local, sin dependencia de servicios en la nube.
- Integración con llama.cpp para el componente de lenguaje (formato GGUF Q4_K_M).
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible en la documentación.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la documentación; el proyecto se limita a ficción interactiva.

## Casos de uso

- Recreación local de Zork I con imágenes: el instalador descarga el LLM Sybylla (GGUF Q4_K_M) y el LoRA de estilo, y el motor del juego genera ilustraciones de cada habitación y diálogos del personaje acompañante sin conexión a internet.
- Prototipo de ficción interactiva con personajes: el fine-tuning de Nemotron 3 Nano 4B sirve como referencia para crear NPCs con voz propia mediante LoRA fusionado y cuantización para despliegue ligero.
- Estudio de empaquetado de assets multi-modelo: el repositorio ejemplifica cómo distribuir un LLM cuantizado y un LoRA de difusión junto con checksums y licencias separadas, útil para quien diseñe instaladores de aplicaciones con IA local.
- Pipeline de generación de imágenes con estilo consistente: el LoRA `trapdoor-style-klein4b-v1` con trigger y fuerza definidos en JSON permite reproducir un estilo visual concreto sobre FLUX.2 klein 4B en flujos de ilustración automatizada.
- Base para experimentos de integración LLM + difusión: la combinación de un modelo de lenguaje pequeño (4B) con un modelo de imagen de 4B en una misma aplicación local es un caso práctico para medir requisitos de hardware y latencia en entornos de consumo.
- Referencia para fine-tuning de Nemotron 3 Nano 4B: el artefacto demuestra el flujo LoRA → merge → GGUF Q4_K_M, reutilizable como plantilla para adaptar el modelo base a dominios conversacionales específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el LLM: el fichero GGUF Q4_K_M de un modelo de 4B ocupa aproximadamente 2,5-2,8 GB, por lo que cabe en GPUs de consumo con 4 GB o más de VRAM; el tamaño total del repo es de 2,9 GB.
- VRAM estimada para el componente de imagen: no disponible en la documentación (depende de FLUX.2 klein 4B y de la configuración de inferencia).
- GPU recomendadas: no disponibles en la documentación; por tamaño, una RTX 3060 de 12 GB o superior debería alojar ambos componentes, aunque no se confirma.
- Cabe en GPU de consumo: sí para el LLM en Q4_K_M; para el modelo de imagen no se especifica.
- Opciones de despliegue: llama.cpp (formato GGUF del LLM); para el LoRA de imagen se requiere el stack compatible con FLUX.2 klein 4B, no detallado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Xork I assets (Sybylla + LoRA trapdoor) | 3.973.556.832 (LLM derivado de Nemotron 3 Nano 4B) | No disponible | NVIDIA Open Model License / Apache 2.0 | Hugging Face, repo de 2,9 GB, 0 descargas |
| NVIDIA Nemotron 3 Nano 4B (base) | 4B | No disponible | NVIDIA Open Model License | Hugging Face (nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16) |
| FLUX.2 klein 4B (base del LoRA de imagen) | 4B | No aplica | Apache 2.0 | Hugging Face (black-forest-labs/FLUX.2-klein-4B) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Proyecto declarado no comercial; el uso comercial de los artefactos requiere revisar la NVIDIA Open Model License y la Apache 2.0 por separado.
- El modelo Sybylla es un derivado de NVIDIA Nemotron 3 Nano 4B y hereda las restricciones de la NVIDIA Open Model License.
- El proyecto no está afiliado ni respaldado por los titulares de la marca Zork; el uso del nombre puede conllevar implicaciones legales en contextos comerciales.
- El fine-tuning está orientado exclusivamente a las líneas del personaje Sybylla en el contexto del juego; no se documenta su comportamiento fuera de ese dominio y es probable que generalice mal a otras tareas.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- No se especifican los idiomas soportados; la ficción original de Zork I es en inglés, por lo que el ajuste probablemente esté sesgado hacia ese idioma.
- Longitud de contexto no documentada; no se recomienda asumir la del modelo base sin verificarla.
- Repositorio con cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- El LoRA de imagen requiere el stack de FLUX.2 klein 4B, cuyos requisitos de hardware no se detallan.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wgruner/xork-i-assets
- Código del proyecto: https://github.com/wgruner/xork-i-mcp
- Modelo base del LLM: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Modelo base del LoRA de imagen: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
