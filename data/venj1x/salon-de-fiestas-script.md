# venj1x/salon-de-fiestas-script

## Resumen

El repositorio `venj1x/salon-de-fiestas-script` **no contiene un modelo de inteligencia artificial**. A pesar de estar alojado en Hugging Face y de declarar una licencia MIT y una lista de idiomas, la model card describe un supuesto ejecutable de Windows (`salon-de-fiestas-script-v1.2.0-win64.exe`) distribuido como archivo ZIP de 8,9 MB con contraseña de descompresión. No se especifica ninguna arquitectura neuronal, conjunto de pesos, tokenizador ni pipeline de inferencia.

El contenido de la tarjeta corresponde a un patrón clásico de distribución de software potencialmente no deseado: instrucciones para descargar un binario desde un repositorio de GitHub de terceros, ejecutarlo "como administrador", introducir una contraseña para descomprimir y desactivar advertencias de Windows Defender o SmartScreen. Las "capacidades" descritas (radar 2D, filtro de loot, teclas de pánico, exclusión de captura de OBS/ShadowPlay, escáner de offsets tras parches) apuntan a un *cheat* o herramienta de trampas para un videojuego, no a un modelo de lenguaje.

Por tanto, esta ficha no puede evaluar parámetros, contexto, cuantizaciones ni rendimiento en benchmarks: esos datos no existen. Se documenta el artefacto para advertir a desarrolladores e investigadores de que la entrada es un señuelo y no debe descargarse ni ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; no verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No hay arquitectura que describir. La model card no menciona transformer, MoE, SSM ni ningún otro diseño neuronal, ni tampoco datos de entrenamiento, número de tokens, proceso de RLHF/DPO o innovaciones técnicas de inferencia. El texto se limita a un "manifiesto de build" con plataforma objetivo (Windows 10 22H2 y Windows 11 24H2), nombre del ejecutable, build `v2.8.2 (CD5D5C841B)`, tamaño del archivo (8,9 MB) y contraseña de descompresión (`2026`).

Las únicas "innovaciones" enumeradas son funcionalidades de un programa de escritorio: núcleo externo en modo usuario con *Desktop Duplication* sin hooks de DLL, cambio en caliente de perfiles JSON, tecla de pánico `END`, radar 2D con filtro de objetos por rareza, capa de renderizado que evita la captura de pantalla y escáner dinámico de offsets. Ninguna de ellas es una capacidad de modelo.

## Capacidades

- No hay generación de texto, razonamiento, código, matemáticas ni visión: el artefacto no es un modelo.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales; la lista de idiomas de los metadatos es decorativa y no se corresponde con ningún componente lingüístico.
- Las "capacidades" declaradas en la model card son de un programa de trampas: radar 2D, filtro de loot, exclusión de captura de OBS/ShadowPlay/Discord, escáner de offsets tras parches y tecla de pánico.
- Advertencia: ejecutar el binario en un equipo de desarrollo o investigación supone un riesgo de seguridad no evaluado.

## Casos de uso

- Ninguno legítimo para desarrolladores o investigadores de IA. El artefacto no permite inferencia, fine-tuning, evaluación ni integración en pipelines.
- Auditoría de seguridad (defensiva): analizar el ZIP y el ejecutable en una máquina aislada o sandbox para documentar el patrón de distribución y alimentar reglas de detección. Solo con personal especializado y sin ejecución en entornos corporativos.
- Formación en concienciación: usar la model card como ejemplo real de ingeniería social en plataformas de modelos (contraseña en el archivo, instrucciones para saltarse SmartScreen, enlaces a repositorios de terceros).
- Estudio de moderación de plataformas: revisar cómo un repositorio con etiquetas de "modelo" puede alojar binarios y qué controles aplicarían Hugging Face o GitHub.
- Denuncia y retirada: recopilar evidencias para notificar el repositorio a Hugging Face y al propietario del repositorio de GitHub enlazado.
- No se recomienda ningún uso operativo, comercial ni de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Plataforma declarada por el autor: Windows 10 (22H2) y Windows 11 (24H2), x64; consumo de RAM indicado en la model card de menos de 21 MB y menos de 59 MB según el módulo.
- Latencia y throughput: no disponibles y no significativos en este contexto.

## Comparativa con modelos similares

No procede comparación con modelos de IA. Como referencia del riesgo, se contrasta con repositorios legítimos de modelos del mismo tamaño nominal:

| Criterio | `venj1x/salon-de-fiestas-script` | Modelo pequeño legítimo (p. ej. ~1B parámetros) |
|---|---|---|
| Contenido | ZIP con `.exe` de 8,9 MB y contraseña | Pesos en safetensors/GGUF |
| Pipeline en Hugging Face | no disponible | `text-generation` u otro declarado |
| Pesos verificables | no | sí, con hashes y tamaño coherente |
| Descargas / likes | 0 / 0 | variable, con histórico |
| Instrucciones de uso | ejecutar como administrador y saltar SmartScreen | cargar con transformers, vLLM o llama.cpp |
| Evaluable con benchmarks | no | sí |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede integrarse en ninguna aplicación de IA.
- Riesgo de seguridad alto: la model card pide ejecutar un `.exe` como administrador, descomprimir con contraseña y evitar las alertas de Windows Defender y SmartScreen. Ese patrón es incompatible con software legítimo.
- El binario se aloja en un repositorio de GitHub de un tercero (`daniellegonzalez0195/salon-de-fiestas-script`), no en Hugging Face; el enlace puede cambiar o desaparecer sin trazabilidad.
- Los metadatos de licencia MIT, idiomas y etiquetas no aportan ninguna garantía sobre el contenido real del artefacto.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Posible infracción de los términos de servicio de un videojuego si el artefacto es un *cheat*, con consecuencias legales y de cuenta para quien lo use.
- No debe descargarse, descomprimirse ni ejecutarse en entornos de producción, investigación o desarrollo. Si ya se ha hecho, se recomienda aislar el equipo, analizarlo con herramientas forenses y rotar credenciales.
- No se han podido verificar las afirmaciones de rendimiento del autor (uso de RAM, hilos de trabajo, exclusión de captura) y no deben tomarse como datos técnicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/venj1x/salon-de-fiestas-script
- Repositorio de GitHub referenciado en la model card: https://github.com/daniellegonzalez0195/salon-de-fiestas-script
- Descarga directa citada en la model card (no recomendada): https://github.com/daniellegonzalez0195/salon-de-fiestas-script/releases/latest/download/salon-de-fiestas-script-v1.2.0-win64.zip
- Paper, blog, demo o repositorio de código del modelo: no disponible
