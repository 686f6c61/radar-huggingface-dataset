# udgamlabs/Akriti

## Resumen

Akriti es un modelo de lenguaje de 0,85 mil millones de parámetros desarrollado por Udgam Labs, especializado en la conversión de texto a escenas 3D. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3.5-0.8B-Base, orientado a una tarea muy concreta: transformar una frase corta en inglés en una descripción textual estructurada de una escena 3D, que posteriormente un cargador fijo dibuja mediante three.js en el navegador.

El modelo resuelve un problema práctico de despliegue: la generación de escenas 3D directamente en el cliente, sin servidor, con un único modelo pequeño que escribe unas 80 fichas de tokens por escena en lugar de páginas enteras de código three.js (que en modelos rivales de mayor tamaño superan los 12.000 tokens de media). Según los datos del autor, tras una descarga única de unos 0,5 GB, el modelo funciona en Chrome mediante wllama, con aproximadamente 1 segundo por escena en la GPU de un Mac mini y unos 16 segundos en la CPU de un Android de gama media de 2021.

La relevancia actual del modelo radica en su enfoque de "modelo pequeño + formato compacto + renderizador fijo": en lugar de pedir al modelo que escriba código completo, le enseña a emitir líneas de un formato propio (S3D) que un cargador determinista interpreta. Esto reduce drasticamente el número de tokens generados, permite ejecución en navegador y, según las métricas del autor, mejora la fidelidad a la petición original frente a un modelo de 4,5B que escribe páginas three.js completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5, con mezcla de atención lineal y atención completa (según la model card) |
| Parametros totales | 852.985.920 (0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso configura n_ctx: 1024 en wllama) |
| Tipos de cuantizacion | GGUF Q4_K_M (fichero s3d-v7-q4_k_m); pesos safetensors en bfloat16; otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp / wllama) |

## Arquitectura y entrenamiento

Akriti parte de Qwen3.5-0.8B-Base, un transformer que, según la model card, combina capas de atención lineal con capas de atención completa. El modelo base incorpora una capa adicional de predicción (referida como `blk.24` en las notas sobre llama.cpp), lo que obliga a usar builds recientes de llama.cpp (b12270 o superior) para cargar correctamente los GGUF; builds anteriores fallan al no reconocer esa capa.

El ajuste fino se orienta a una única tarea: dado el prompt exacto `Scene: <frase>\nS3D:\n`, generar una escena en formato S3D de aproximadamente 80 tokens, con líneas para cielo, suelo, sol y objetos (tipo, posición, escala, giro, colores y palabras de material o variante). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; la model card solo documenta la evaluación posterior y el formato de salida. La innovación técnica destacable no está en el entrenamiento sino en el diseño del pipeline: el modelo no escribe código, sino un DSL compacto que un cargador fijo (`loader.js`) interpreta con three.js, lo que traslada la complejidad de renderizado fuera del modelo.

## Capacidades

- Generación de texto estructurado en formato S3D: escenas 3D descritas en líneas de texto compactas (cielo, suelo, sol y objetos).
- Conversión de frases cortas en inglés a escenas 3D renderizables con three.js.
- Conocimiento de un catálogo cerrado de objetos: casa, granero, torre de castillo, torre de bloques, faro, molino, puente, valla, tienda, banco, farola, coche, camión, tren, avión, barco, cohete, perro, gato, pájaro, árbol (pino, redondo, palmera), flor, seta, muñeco de nieve, mesa, silla, sofá, cama, estantería, taza, pelota y planeta.
- Formas geométricas primitivas: cubo, esfera, cilindro, cono, anillo, pirámide y cápsula.
- Materiales: metal, cristal y brillante (glow).
- Relaciones espaciales: al lado de, detrás, delante, sobre una mesa, encima de, entre, flotando, alrededor, en fila, debajo, orientado hacia, pares grande/pequeño, torres de dos colores y recuentos hasta ocho.
- Variantes de cielo (día, atardecer, noche, gris) y de suelo (hierba, arena, nieve, piedra, agua), con escenarios (carretera, parque, jardín, playa, desierto, bosque).
- Ejecución en navegador mediante wllama (GGUF) y en llama.cpp con `llama-completion` (no `llama-cli`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Generación de escenas 3D en el navegador sin servidor: tras una descarga única de unos 0,5 GB, el modelo escribe la escena y `loader.js` la dibuja con three.js; adecuado para demos interactivas, portales educativos o herramientas de creación rápida donde no se quiere depender de una API externa.
- Prototipado rápido de entornos 3D para videojuegos o experiencias web: permite pasar de una frase descriptiva a una escena renderizable en segundos, útil para maquetas de niveles, storyboards o pruebas de concepto.
- Visualización educativa de descripciones textuales: convertir frases en inglés en escenas 3D para clases de idiomas, primaria o introducción a la geometría, con objetos, colores y relaciones espaciales acotados y verificables.
- Herramienta de autoría asistida en aplicaciones web: integrar el modelo en editores que permitan al usuario describir una escena y obtener una representación 3D preliminar que luego se refine manualmente.
- Despliegue en dispositivos móviles de gama media: con `n_gpu_layers: 0` en Android, el modelo funciona en CPU (unos 16 segundos por escena en un Android de 2021), lo que lo hace viable para apps offline o con conectividad limitada.
- Evaluación y benchmarking de pipelines texto-a-3D: el formato compacto (unas 80 fichas por escena) y la reproducibilidad (temperatura 0, parada en línea en blanco) lo convierten en una línea base útil para comparar enfoques de generación de escenas.
- Generación de contenido para escenas de realidad aumentada o webXR sencillas: las primitivas, materiales y relaciones espaciales acotadas permiten construir escenas ligeras que se integran en visualizadores three.js.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación interna del autor (Udgam Labs, 10 de noviembre de 2026) sobre 150 prompts libres, con checklist de objetos, colores, recuentos y relaciones, renderizado en Chromium headless con three.js 0.160 y juicio por un modelo Qwen3.5-9B con capacidades de visión. La model card proporcionada no incluye la tabla completa de resultados, solo el dato agregado y la comparación con un rival de 4,5B:

| Metrica | Akriti (0,8B) | Modelo rival (4,5B) |
|---|---|---|
| Escenas que renderizan correctamente | 150/150 (todas) | no disponible en detalle |
| Elementos solicitados confirmados por juez de visión | 92,8% | 63,1% |
| Tokens medianos por escena | ~80 | 12.430 |
| Velocidad en GPU (Mac mini) | ~1 s por escena | no disponible |
| Velocidad en CPU (Android gama media 2021) | ~16 s por escena | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con pesos bfloat16, en torno a 1,7 GB para el modelo completo (0,85B parámetros × 2 bytes), más overhead de activaciones; con GGUF Q4_K_M, aproximadamente 0,5 GB de descarga y huella en memoria del orden de 0,5-0,7 GB.
- GPU recomendadas: cualquier GPU consumer reciente basta; el autor cita un Mac mini (GPU integrada) con ~1 s por escena. Para transformers con kernels rápidos, se recomienda CUDA con `flash-linear-attention` y `causal-conv1d` instalados.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM para bfloat16 o ~1 GB para GGUF Q4_K_M; también funciona en CPU, aunque el autor advierte que en transformers sobre CPU "una escena puede tardar muchos minutos" por la mezcla de atención lineal y completa sin kernels rápidos.
- Opciones de despliegue: wllama 3.13 en navegador (GGUF), llama.cpp (build b12270 o superior, usando `llama-completion`), transformers 5.22 o superior (safetensors, bfloat16).
- Latencia y throughput: ~1 s por escena en GPU de Mac mini; ~16 s por escena en CPU de Android de gama media de 2021; en transformers sobre CPU sin kernels rápidos, varios minutos por escena.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akriti (Udgam Labs) | 0,85B | no disponible (ejemplo con n_ctx 1024) | Texto a escena 3D en formato S3D compacto | Apache 2.0 | Hugging Face, Space, GitHub |
| Rival de 4,5B citado por el autor | 4,5B | no disponible | Texto a página three.js completa | no disponible | no disponible en detalle |
| Qwen3.5-0.8B-Base (modelo base) | 0,8B | no disponible | Modelo de lenguaje general | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con otros modelos texto-a-3D de la misma categoría; la model card solo ofrece la comparación agregada con el rival de 4,5B (92,8% frente a 63,1% de elementos confirmados, y ~80 frente a 12.430 tokens medianos por escena).

## Limitaciones y advertencias

- Idioma: solo soporta inglés; las frases en otros idiomas no están cubiertas por el entrenamiento ni por la evaluación.
- Dominio cerrado: el catálogo de objetos, formas, materiales y relaciones espaciales es finito; peticiones fuera de ese vocabulario pueden producir escenas incompletas o incorrectas.
- Formato estricto: requiere el prompt exacto `Scene: <frase>\nS3D:\n`, decodificación greedy (temperatura 0) y parada en la primera línea en blanco; desviarse del formato degrada la salida.
- Riesgo de alucinación: al ser un modelo pequeño ajustado a una tarea, puede inventar tipos de objeto no reconocidos por el cargador o combinaciones de posición/escala incoherentes; el cargador reporta errores (`errors` en `loadS3D`).
- Compatibilidad de herramientas: llama.cpp requiere build b12270 o superior (builds anteriores fallan en `blk.24`); transformers requiere 5.22 o superior; wllama requiere 3.13.
- Rendimiento en CPU: en transformers sobre CPU sin kernels rápidos, la inferencia puede tardar muchos minutos por escena; no es adecuado para producción interactiva sin GPU o sin GGUF.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B-Base y de las dependencias (three.js, wllama) por separado.
- Métricas del autor: los resultados (92,8% de elementos confirmados, 150/150 escenas renderizadas) provienen de una evaluación interna de Udgam Labs con 150 prompts y un juez de visión Qwen3.5-9B; no son benchmarks estándar revisados por terceros.
- Contexto: la longitud de contexto oficial no está documentada; el ejemplo de uso configura 1024 tokens en wllama, suficiente para el prompt y ~400 tokens de salida, pero no para conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Akriti
- Space de demostración: https://huggingface.co/spaces/udgamlabs/Akriti
- Repositorio GitHub: https://github.com/udgamlabs/akriti
- Documentación del formato S3D: https://github.com/udgamlabs/akriti/blob/main/docs/S3D.md
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/akriti
- wllama: https://github.com/ngxson/wllama
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
