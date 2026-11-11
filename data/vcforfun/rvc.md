# vcforfun/rvc

## Resumen

`vcforfun/rvc` es un repositorio de activos (assets) para la aplicación Android RvcVoice, no un modelo de lenguaje en el sentido habitual. Contiene un catálogo (`catalog.json`), un paquete de inferencia compartido (`shared_runtime.zip`) y tres paquetes de voces predefinidas en formato propietario `.rvcpack` (preset_anime_bright, preset_deep_narrator, preset_crisp_boy). El repositorio está diseñado para que la app descargue directamente estos ficheros mediante URLs de Hugging Face.

El contenido se basa en la tecnología RVC (Retrieval-based Voice Conversion), un paradigma de conversión de voz a voz que emplea HuBERT para la extracción de características y RMVPE para el seguimiento de tono (pitch tracking). El `shared_runtime.zip` incluye los directorios `hubert/`, `rmvpe/` y `hotswap/` (plantillas 40k T1280). Los paquetes de voz son ficheros `.rvcpack` que contienen un `manifest.json` y un `net_g.pte` (modelo TorchScript exportado para ejecución en dispositivo).

La relevancia de este repositorio es limitada fuera del ecosistema de la app RvcVoice: no es un modelo entrenable ni publica pesos en formatos estándar (safetensors, GGUF, `.pth`). El autor indica explícitamente que la redistribución y el permiso comercial de cada voz están pendientes de confirmar, y que faltan muestras de audio reales de 3 segundos para las voces oficiales. El tamaño del repositorio es de 1,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC (Retrieval-based Voice Conversion): HuBERT + RMVPE + decoder `net_g` exportado a TorchScript (`.pte`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.rvcpack` (manifest.json + net_g.pte), `.zip` con hubert/, rmvpe/, hotswap/ |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento de las voces. La arquitectura subyacente es la de RVC: un extractor de características HuBERT para representaciones auto-supervisadas del habla, un estimador de pitch RMVPE y un decoder neuronal (`net_g`) exportado a TorchScript para inferencia en dispositivo. El `shared_runtime.zip` actúa como runtime compartido entre todas las voces, con plantillas `hotswap/` de 40k T1280 que permiten intercambiar cabezas de voz sin recargar el runtime completo.

No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo ajuste por RLHF/DPO (no aplica en conversión de voz). Las tres voces oficiales son paquetes de producto (`.rvcpack`), no los zips comunitarios de `.pth`, lo que sugiere un pipeline de exportación propietario no descrito en la model card.

## Capacidades

- Conversión de voz a voz (voice-to-voice) con preservación de prosodia y tono mediante RMVPE.
- Tres voces predefinidas: `preset_anime_bright`, `preset_deep_narrator`, `preset_crisp_boy`.
- Intercambio en caliente de voces (`hotswap`) sobre un runtime compartido.
- Inferencia en dispositivo Android mediante TorchScript (`.pte`).
- Catálogo remoto consultable por la app para descubrir y descargar paquetes de voz.
- No soporta generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio de entrada distinto de voz, etc.).

## Casos de uso

- **Doblaje y narración de contenido corto**: usar `preset_deep_narrator` para locuciones en vídeos o audiolibros, aprovechando la conversión voz-a-voz para mantener la entonación del narrador original.
- **Modding y contenido de fans**: aplicar `preset_anime_bright` a grabaciones propias para generar voces estilizadas en proyectos amateur, dado que la app está orientada a este perfil.
- **Pruebas de accesibilidad vocal**: transformar la voz de un usuario hacia un preset para experimentar con identidades vocales alternativas en contextos de comunicación asistida.
- **Prototipado de asistentes de voz**: integrar el runtime compartido en una app Android para validar pipelines de conversión de voz antes de entrenar voces propias.
- **Investigación en conversión de voz**: emplear `hubert/` y `rmvpe/` del `shared_runtime.zip` como componentes de referencia en experimentos de VC.
- **Demostraciones y demos de producto**: descargar los `.rvcpack` desde el catálogo oficial para mostrar la funcionalidad de la app RvcVoice sin necesidad de entrenar modelos.
- **Evaluación de latencia en dispositivo**: medir el rendimiento de `net_g.pte` en distintos SoCs Android usando las plantillas 40k T1280.
- **Distribución de voces personalizadas**: empaquetar voces propias en formato `.rvcpack` siguiendo el layout del repositorio para consumo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Inferencia**: el repositorio está pensado para ejecución en dispositivo Android; no se documentan requisitos de VRAM ni de GPU de escritorio.
- **GPU recomendadas**: no disponible. El runtime se distribuye como TorchScript (`.pte`) para CPU/NPU móvil, no como pesos para GPU de servidor.
- **Consumer GPU**: no disponible; el formato `.pte` no está pensado para su uso directo en GPUs de consumo tipo RTX 4090.
- **Opciones de despliegue**: la app Android RvcVoice (cliente oficial). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. El tamaño del repo (1,1 GB) incluye runtime y tres voces, pero no se aportan métricas de tiempo real ni de factor de tiempo real (RTF).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `vcforfun/rvc` | Pack de voces RVC para app Android | no disponible | no aplica | no disponible | `.rvcpack`, `.zip`, `.pte` | Hugging Face (repo) |
| RVC-Project/Retrieval-based-Voice-Conversion-WebUI | Framework RVC de código abierto | no disponible | no aplica | MIT (según repo upstream) | `.pth`, `.index` | GitHub |
| so-vits-svc | Framework de conversión de voz | no disponible | no aplica | AGPL-3.0 (según repo upstream) | `.pth`, `.pt` | GitHub |
| OpenVoice (MyShell) | Clonación de voz zero-shot | no disponible | no aplica | MIT (según repo upstream) | `.pth`, `.pt` | GitHub / Hugging Face |

La comparación es orientativa: `vcforfun/rvc` no publica pesos en formatos estándar ni licencia explícita, lo que dificulta una comparación técnica directa con los frameworks upstream de RVC o so-vits-svc.

## Limitaciones y advertencias

- **Licencia no declarada**: no se especifica licencia en la model card ni en los metadatos; el uso comercial queda sin autorización explícita.
- **Redistribución pendiente**: el propio autor indica que falta confirmar el permiso de redistribución y comercial de cada voz con su creador o entrenador.
- **Muestras de audio ausentes**: no hay `sample_3s.wav` reales para las voces oficiales; los hashes placeholder se ignoran deliberadamente en la app, por lo que la previsualización de 3 segundos no funcionará.
- **Formato propietario**: los `.rvcpack` no son compatibles con los flujos comunitarios de RVC (`.pth` + índice FAISS); requieren la app RvcVoice o ingeniería inversa del manifiesto.
- **Sin datos de entrenamiento ni evaluación**: no se publican métricas objetivas (MOS, similitud de hablante, RTF) ni detalles del dataset.
- **Riesgo de uso indebido**: la conversión de voz permite suplantación de identidad; no se documentan mecanismos de consentimiento ni marcas de agua.
- **Idiomas no declarados**: no se especifica qué lenguas cubren las voces; la calidad fuera del idioma de entrenamiento puede degradarse.
- **Sesgos**: no evaluados; al ser voces predefinidas, pueden incorporar sesgos de género, edad o estilo presentes en los datos originales.
- **Alucinación**: no aplica en el sentido de LLM, pero la conversión puede producir artefactos, ruido o inestabilidad de pitch en entradas fuera de distribución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vcforfun/rvc
- Catálogo oficial: https://huggingface.co/vcforfun/rvc/resolve/main/catalog.json
- Runtime compartido: https://huggingface.co/vcforfun/rvc/resolve/main/shared_runtime.zip
- RVC-Project (upstream): https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- so-vits-svc: https://github.com/svc-develop-team/so-vits-svc
- OpenVoice: https://github.com/myshell-ai/OpenVoice
