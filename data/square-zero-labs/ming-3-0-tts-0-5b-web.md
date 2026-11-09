# square-zero-labs/ming-3.0-tts-0.5b-web

## Resumen

Ming-3.0-tts-0.5B-web es una compilación del modelo de síntesis de voz `inclusionAI/Ming-3.0-tts-0.5B` empaquetada como bundle para el runtime de navegador `ming-wasm`, desarrollado por square-zero-labs sobre la infraestructura de fusor-ai. No se trata de un checkpoint en PyTorch ni en safetensors, sino de un artefacto compilado que solo carga en el runtime WebAssembly de ming-wasm, pensado para ejecutar TTS directamente en la CPU del dispositivo del usuario sin enviar datos a un servidor.

El modelo base tiene 0,5 mil millones de parámetros y está especializado en text-to-speech. La compilación usa el perfil `mix`: capas del LLM y decodificador VAE a 4 bits, y cabeza flow, agregador y embeddings a 7 bits, con un tamaño total de bundle de 850 MB (el repositorio ocupa 0,9 GB). El manifiesto `manifest.json` lista cada tensor y parte, y el runtime verifica el hash BLAKE3 de cada parte durante la carga.

Su relevancia está en el despliegue on-device en navegador: permite integrar síntesis de voz en aplicaciones web sin backend de inferencia, con verificación de integridad de pesos y licencia MIT. La reproducibilidad está documentada mediante `just model` en el repositorio ming-wasm, que descarga el checkpoint original y compila el mismo bundle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de TTS; bundle compilado con fusor-ai) |
| Parametros totales | 0,5B (según nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (capas LLM y decodificador VAE), 7 bits (cabeza flow, agregador y embeddings); perfil `mix` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | bundle fusor-ai (`manifest.json` + partes con hash BLAKE3); no es safetensors ni GGUF; solo carga en ming-wasm |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `inclusionAI/Ming-3.0-tts-0.5B` en la documentación proporcionada. La model card del bundle menciona componentes propios de un pipeline de TTS moderno: capas de LLM, una cabeza flow, un agregador, embeddings y un decodificador VAE. Esta combinación sugiere un esquema de generación en dos etapas (predicción de representaciones latentes y decodificación a audio), pero no se detalla la topología exacta ni el paradigma de entrenamiento.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica documentada es el propio proceso de compilación: fusor-ai transforma el checkpoint original (revisión `e5bd8da31ecf1b9276cdbdda821fa891068f1368`) en un bundle con cuantización mixta por componente y verificación de integridad mediante BLAKE3 en tiempo de carga, lo que permite ejecución en CPU dentro de un navegador.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Ejecución on-device en la CPU del dispositivo del usuario, sin backend de inferencia.
- Despliegue en navegador mediante WebAssembly a través del runtime ming-wasm.
- Verificación de integridad de pesos en carga mediante hashes BLAKE3 por parte del bundle.
- Reproducibilidad del bundle documentada mediante `just model` en el repositorio ming-wasm.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Lectura por voz de contenido web en el navegador: el bundle se carga en ming-wasm y sintetiza texto en la CPU local, útil para artículos, documentación o interfaces de accesibilidad sin depender de un servicio de TTS en la nube.
- Accesibilidad en aplicaciones web: integración de narración de texto para usuarios con discapacidad visual, ejecutándose en el dispositivo y evitando el envío de contenido sensible a servidores externos.
- Asistentes conversacionales en el navegador: combinación con otros modelos on-device para dar respuesta hablada a interacciones de chat, manteniendo la conversación íntegramente en el cliente.
- Aplicaciones educativas de idiomas: reproducción de frases y ejercicios de pronunciación generados dinámicamente, con latencia local y sin coste por petición.
- Prototipado y demos: el despliegue público en ming-wasm.fusor.build permite evaluar la calidad del TTS sin instalar dependencias ni configurar infraestructura.
- Privacidad por diseño en sectores regulados: al no salir el texto del dispositivo, encaja en flujos donde el contenido no puede transmitirse a terceros, como lectura de documentos internos o sanitarios.
- Distribución de aplicaciones web offline-first: el bundle puede servirse como asset estático y ejecutarse sin conexión una vez cargado, adecuado para PWA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el bundle está diseñado para ejecución en CPU del navegador. El tamaño del artefacto es de 850 MB (repositorio de 0,9 GB).
- GPU recomendadas: no disponible; el runtime documentado es de CPU vía WebAssembly.
- Compatibilidad con GPU de consumo: no disponible para este bundle; no se documenta aceleración por GPU.
- Opciones de despliegue: exclusivamente el runtime ming-wasm (WebAssembly en navegador). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato no es safetensors ni GGUF.
- Latencia y throughput estimados: no disponible.
- Requisito práctico: el navegador debe poder descargar y verificar un bundle de 850 MB, con el coste de carga inicial que ello implica.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparación cuantitativa fiable con alternativas de TTS de tamaño similar. La comparación relevante en este caso es de formato de despliegue: frente a checkpoints en safetensors o GGUF, este bundle solo es ejecutable en ming-wasm, lo que limita su portabilidad pero habilita el despliegue en navegador con verificación de integridad.

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B-web | 0,5B | no disponible | bundle fusor-ai | MIT | ming-wasm (navegador, CPU) |
| inclusionAI/Ming-3.0-tts-0.5B | 0,5B | no disponible | no disponible | MIT | no disponible |
| Alternativas de TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El bundle no es un checkpoint estándar: solo carga en el runtime ming-wasm. No puede usarse con PyTorch, transformers, vLLM, llama.cpp ni Ollama.
- La cuantización mixta (4 y 7 bits) puede degradar la calidad del audio respecto al modelo original en precisión completa; no se documenta la magnitud de esa degradación.
- El tamaño de descarga (850 MB) es elevado para un recurso web y condiciona el tiempo de primera carga y el consumo de datos del usuario.
- No se documentan los idiomas soportados, lo que impide garantizar cobertura multilingüe.
- No hay información sobre sesgos, tasas de alucinación o artefactos de síntesis del modelo base.
- Riesgo de uso indebido: la licencia MIT permite uso comercial, pero la model card exige etiquetar el audio sintético como sintético; el incumplimiento puede facilitar suplantación de voz.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- No se dispone de datos de latencia ni de rendimiento en dispositivos de gama baja, donde la inferencia en CPU puede ser lenta.

## Enlaces

- Hugging Face: https://huggingface.co/square-zero-labs/ming-3.0-tts-0.5b-web
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Repositorio fusor-ai: https://github.com/fusor-rs/fusor-ai
- Repositorio ming-wasm: https://github.com/fusor-rs/ming-wasm
- Demo: https://ming-wasm.fusor.build
