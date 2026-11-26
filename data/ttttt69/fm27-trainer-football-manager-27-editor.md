# Ttttt69/fm27-trainer-football-manager-27-editor

## Resumen

El repositorio `Ttttt69/fm27-trainer-football-manager-27-editor` no contiene un modelo de inteligencia artificial, sino un supuesto entrenador (trainer) y editor de atributos en vivo para el videojuego Football Manager 27, empaquetado como aplicación portable para Windows 10 y Windows 11 de 64 bits. El autor, identificado como Ttttt69, lo publica en Hugging Face bajo licencia MIT, con etiquetas que apuntan a DirectX 12, Vulkan y una arquitectura de ejecución nativa x64. No hay pesos, tokenizador, configuración de transformer ni pipeline de inferencia asociados.

La model card describe una herramienta de modificación en memoria (PA/CA, es decir, habilidad potencial y habilidad actual de los jugadores) con configuración JSON recargable en caliente, alineación de registros vectoriales AVX2 y una matriz de rendimiento medida en cuatro configuraciones de hardware. Los datos de "benchmarks" que presenta son métricas de latencia de frame pacing y consumo de memoria de la herramienta, no resultados de evaluación de un modelo de lenguaje.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto ni capacidades lingüísticas reales. Se redacta completa, indicando de forma explícita qué campos no están disponibles y advirtiendo de que el contenido encaja en el patrón de repositorios señuelo con enlaces de descarga externos, contraseñas de archivo y redirecciones a GitHub, lo que exige precaución antes de ejecutar cualquier binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de IA; herramienta nativa x64 para Windows) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el paquete se distribuye como `.zip` portable) |
| Idiomas soportados | en, es, pt, de, fr, tr, pl, ja, ko, id, vi, zh (12 idiomas, según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | No disponible (no hay safetensors, GGUF ni binarios de pesos; el artefacto citado es `dlssg-to-xefg-universal-wrapper-v3.2.2-win64.zip`) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal ni proceso de entrenamiento. La documentación habla de una compilación standalone de 64 bits para Windows 10 (22H2+) y Windows 11 (23H2/24H2), con "alineación de registros vectoriales AVX2", "ejecución en tiempo de ejecución de bajo overhead" y configuración JSON recargable en caliente (`config/settings.json`). Son afirmaciones propias de una utilidad de modificación de memoria de un juego, no de un modelo fundacional.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni innovaciones como decodificación especulativa o atención lineal. Cualquier intento de rellenar estos campos sería una invención.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- La "capacidad multilingüe" se limita a la localización de la documentación y de la interfaz en 12 idiomas.
- Función declarada: modificación en vivo de atributos PA/CA en Football Manager 27 y ajustes de entrenador dentro del juego.
- Configuración mediante archivo JSON y presets editables.

## Casos de uso

- Edición de atributos de jugadores en una partida de Football Manager 27: la herramienta se acoplaría al proceso del juego para alterar valores de PA/CA en memoria; es el único uso que la documentación declara.
- Ajuste de parámetros del entrenador durante una sesión: modificación de valores internos sin reiniciar el juego, según el mecanismo de recarga en caliente descrito.
- Pruebas de escenarios en FM27: alterar atributos para simular plantillas y validar comportamientos del motor del juego.
- Documentación multilingüe para comunidades de habla hispana, portuguesa, alemana, francesa, turca, polaca, japonesa, coreana, indonesia, vietnamita y china: el repositorio etiqueta 12 idiomas.
- Verificación de integridad de un binario antes de ejecutarlo: la model card menciona comprobaciones SHA-256, aunque no aporta los hashes.
- No es adecuado para ningún caso de uso de IA: atención al cliente, generación de código, RAG, agentes o análisis de datos quedan fuera de su alcance por definición.

## Benchmarks y rendimiento

La model card presenta una matriz de telemetría de la herramienta, no benchmarks de un modelo. Se reproduce a continuación como dato declarado por el autor, sin verificación independiente:

| Perfil de hardware | API / runtime | Latencia p99 | Memoria | Integridad |
|---|---|---|---|---|
| RTX 4070 / Ryzen 7 7800X3D (Win 11 24H2) | DX12 / Vulkan 1.3 | 1,42 ms (+48 % 1% low FPS) | 44,8 MB RAM | PASS (SHA-256) |
| RTX 3060 / Core i5-13600K (Win 11 23H2) | DX12 / AVX2 | 1,89 ms (+41 % 1% low FPS) | 42,4 MB RAM | PASS (SHA-256) |
| RX 7800 XT / Ryzen 5 7600X (Win 10 22H2) | Vulkan / Async Compute | 1,65 ms (+44 % 1% low FPS) | 43,1 MB RAM | PASS (SHA-256) |
| Intel Arc A770 / Core i7-12700K (Win 11 24H2) | XeSS / DX12 SwapChain | 2,15 ms (+37 % 1% low FPS) | 45,2 MB RAM | PASS (SHA-256) |

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, porque no existe un modelo que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo.
- GPU recomendadas: la documentación cita RTX 4070, RTX 3060, RX 7800 XT e Intel Arc A770 como plataformas de prueba de la herramienta.
- Cabe en cualquier GPU consumer moderna con soporte DirectX 12 o Vulkan 1.3, según los perfiles declarados.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son pertinentes). El artefacto es un `.zip` portable para Windows x64.
- Latencia y throughput: los únicos datos son los de la tabla anterior (1,42–2,15 ms p99), referidos al frame pacing del juego, no a inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable: los elementos análogos serían otras utilidades de modificación (trainers) para Football Manager, sobre las que no se ha proporcionado información. Comparar con modelos de lenguaje como Llama, Mistral o Qwen carecería de sentido técnico.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje, visión o agente es improcedente.
- El repositorio presenta un patrón típico de señuelo: enlaces de descarga alojados en un repositorio de GitHub de terceros (`Bianchi61/dlssg-to-xefg-universal-wrapper`), contraseña de archivo (`2026`), repositorios duplicados y portales `github.io`. No hay hashes publicados que permitan verificar la integridad del binario.
- Ejecutar binarios de procedencia no verificada conlleva riesgo de malware; la mención de "SHA-256 PASS" sin hashes concretos no constituye una verificación.
- La licencia MIT se declara sobre el repositorio, pero la modificación de un videojuego comercial puede contravenir los términos de servicio del editor de Football Manager; el uso comercial de la herramienta es, en la práctica, inviable.
- Cero descargas y cero "likes" en el momento de la consulta, sin historial que respalde las afirmaciones de la model card.
- Idiomas: los 12 idiomas etiquetados corresponden a la documentación; no hay capacidad de traducción ni de generación.
- Fechas de creación y actualización (2026-11-25) y referencias a "2026" en la documentación: no verificables de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ttttt69/fm27-trainer-football-manager-27-editor
- Repositorio GitHub citado (principal): https://github.com/maria60410/fm27-trainer-football-manager-27-editor
- Repositorio GitHub citado (day-0): https://github.com/floyreq/fm27-trainer-football-manager-27-editor
- Portal 3-Tab citado: https://maria60410.github.io/fm27-trainer-football-manager-27-editor/
- Documentación Go citada: https://pkg.go.dev/github.com/floyreq/fm27-trainer-football-manager-27-editor
- Notebook citado: https://nbviewer.org/github/floyreq/fm27-trainer-football-manager-27-editor/blob/main/notebooks/quickstart.ipynb
- Archivo de descarga citado: https://github.com/Bianchi61/dlssg-to-xefg-universal-wrapper/releases/download/v3.2.2/dlssg-to-xefg-universal-wrapper-v3.2.2-win64.zip
