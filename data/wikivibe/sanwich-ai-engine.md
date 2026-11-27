# WiKiVibe/SanWich-AI-Engine

## Resumen

SanWich AI Engine es el repositorio oficial de descarga del motor de reconocimiento automatico del habla (ASR) y refinado de subtitulos de la aplicacion SanWich, desarrollada por WiKiVibe. No se trata de un modelo de lenguaje en sentido estricto, sino de un paquete de inferencia propietario orientado a la transcripcion de audio a texto en chino tradicional y a la correccion de subtitulos, distribuido como componente auxiliar de una aplicacion de escritorio para Windows.

El repositorio, de 11,1 GB, contiene artefactos binarios (el ejecutable ligero de la aplicacion y el entorno de computo CUDA 12) y no publica pesos en formatos abiertos como safetensors o GGUF. La model card no documenta arquitectura, numero de parametros, longitud de contexto ni composicion del dataset de entrenamiento, por lo que la mayor parte de las especificaciones tecnicas habituales quedan como no disponibles.

Su relevancia practica es limitada para el ecosistema open source: la licencia es una EULA propietaria (wikivibe-sanwich-eula), el software no es de codigo abierto y el acceso esta pensado para usuarios finales de la aplicacion, no para integracion en pipelines de terceros. La version publica en pruebas es la 3.0.0-beta.7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino tradicional (segun tag de la model card); resto no disponible |
| Licencia | wikivibe-sanwich-eula (propietaria, no open source) |
| Formato de pesos | no disponible (el repositorio contiene archivos ZIP de aplicacion y de entorno CUDA 12) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, convolucional, hibrida u otra), el numero de parametros, la longitud de contexto ni los datos de entrenamiento. La model card se limita a describir el proposito del producto (voz a texto y refinado de subtitulos en Windows) y a listar los archivos descargables.

Tampoco se documentan procesos de ajuste fino, RLHF, DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico detalle tecnico verificable es la dependencia de un entorno de computo CUDA 12, que la aplicacion descarga automaticamente en el primer arranque, lo que sugiere inferencia acelerada por GPU NVIDIA, sin que se especifiquen las GPU soportadas.

## Capacidades

- Transcripcion de voz a texto (ASR) orientada a chino tradicional, segun las etiquetas del repositorio.
- Refinado y correccion de subtitulos, segun la descripcion del producto en la model card.
- Integracion como componente de la aplicacion de escritorio SanWich para Windows.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo consta el chino tradicional; el resto no disponible.
- Capacidades especiales (modo thinking, vision, audio de entrada mas alla del ASR): no disponible.

## Casos de uso

- Subtitulado de videos en chino tradicional: el motor transcribe el audio y la aplicacion aplica un refinado de subtitulos, adecuado para creadores que publican contenido en esa variante linguistica.
- Transcripcion de reuniones y entrevistas en Windows: al ejecutarse como aplicacion de escritorio con entorno CUDA 12, permite procesar audio localmente en equipos con GPU NVIDIA, sin depender de servicios en la nube.
- Postproduccion de material audiovisual: la funcion de refinado de subtitulos reduce la correccion manual de puntuacion y segmentacion tras la transcripcion automatica.
- Generacion de subtitulos para accesibilidad: util para dotar de subtitulos a contenido hablado en chino tradicional destinado a plataformas de video.
- Archivado y busqueda de contenido hablado: la transcripcion permite indexar grabaciones y localizar fragmentos por texto.
- Uso educativo y de documentacion: transcripcion de clases o ponencias en chino tradicional para su posterior revision por parte de estudiantes.

En todos los casos, el uso esta condicionado a la licencia propietaria y a la aplicacion SanWich; no se documenta una API publica ni un servidor de inferencia para integracion en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el unico requisito documentado es un entorno CUDA 12, lo que implica GPU NVIDIA compatible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la unica via documentada es la aplicacion SanWich para Windows, que descarga automaticamente el paquete `SanWich_AI_Engine_CUDA12_v3.zip`. No consta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio ocupa 11,1 GB, cifra que da una idea del volumen de los artefactos a descargar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SanWich AI Engine | ASR propietario para chino tradicional | no disponible | no disponible | wikivibe-sanwich-eula (propietaria) | Solo como parte de la aplicacion SanWich |
| Whisper (OpenAI) | ASR open source | 39M a 1,55B segun variante | 30 s por ventana de audio | MIT | Pesos abiertos en multiples formatos |
| faster-whisper | Implementacion optimizada de Whisper | segun variante de Whisper | 30 s por ventana de audio | MIT | Pesos abiertos, CTranslate2 |

La comparacion con Whisper y faster-whisper es la mas directa por categoria de tarea (ASR), pero no se dispone de datos de rendimiento de SanWich AI Engine que permitan contrastar calidad, latencia o cobertura linguistica. Para el resto de alternativas especificas de ASR en chino tradicional, no disponible.

## Limitaciones y advertencias

- Licencia propietaria: el uso se rige por la EULA de WiKiVibe; no es software de codigo abierto y las condiciones de uso comercial deben consultarse en el enlace de la EULA.
- Ausencia de transparencia tecnica: no se publican arquitectura, parametros, datos de entrenamiento ni evaluaciones, lo que impide auditar sesgos o calidad de forma independiente.
- Cobertura linguistica limitada segun la documentacion: solo se declara chino tradicional; el comportamiento en otros idiomas no esta documentado.
- Riesgo de alucinacion y errores de transcripcion: inherente a los sistemas ASR, sin que se hayan publicado tasas de error (WER) que permitan cuantificarlo.
- Dependencia de plataforma: la aplicacion es para Windows y el entorno de computo requiere CUDA 12, lo que excluye despliegues en Linux, macOS o entornos sin GPU NVIDIA.
- Sin API ni servidor de inferencia documentado: la integracion en produccion fuera de la aplicacion SanWich no esta soportada oficialmente.
- Version en pruebas: la version publica es 3.0.0-beta.7, con posibles cambios e inestabilidades.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WiKiVibe/SanWich-AI-Engine
- Sitio oficial de WiKiVibe: https://wikivibe.win/
- Pagina de descarga de SanWich: https://wikivibe.win/?app=sanwich
- EULA: https://github.com/WiKiVibe/SanWich/blob/main/docs/EULA.md
- Avisos de terceros: https://github.com/WiKiVibe/SanWich/blob/main/docs/THIRD_PARTY_NOTICES.md
- Contacto: service@wikivibe.win
