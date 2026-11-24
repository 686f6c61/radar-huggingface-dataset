# zaper4life/inzoi-cheat-trainer-free

## Resumen

El artefacto publicado bajo el identificador `zaper4life/inzoi-cheat-trainer-free` en Hugging Face no es un modelo de inteligencia artificial ni un conjunto de pesos entrenados. Se trata de un paquete ejecutable para Windows x64 (un archivo ZIP de 8,9 MB con un binario `inzoi-cheat-trainer-free-v1.2.0-win64.exe`) distribuido a través de un repositorio de GitHub (`OlgaZhou60580/inzoi-cheat-trainer-free`) y etiquetado en Hugging Face con metadatos propios de un modelo (licencia MIT, lista de idiomas). La model card describe funcionalidades de tipo *cheat trainer* para el videojuego InZOI: superposición externa a 144 Hz, radar 2D, filtro de objetos por rareza, suavizado de entrada Bézier y escáner dinámico de offsets.

No existe información alguna sobre arquitectura de red neuronal, parámetros, contexto, tokenizador, datos de entrenamiento ni proceso de alineación. El repositorio no tiene descargas ni *likes* en el momento de la consulta y su fecha de creación (2026-11-24) es posterior a la de esta ficha, lo que junto con la naturaleza del contenido sugiere un artefacto de distribución de software, no un modelo lingüístico. Por tanto, esta ficha documenta lo que el artefacto declara ser y advierte de que no es evaluable como modelo de IA.

La relevancia técnica es nula desde el punto de vista del aprendizaje automático: no hay benchmarks, no hay pesos y no hay pipeline declarado. La ficha se completa por rigor documental, indicando explícitamente cada dato no disponible y las advertencias de seguridad asociadas a la ejecución de binarios de origen no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO o similares). El artefacto no contiene pesos de modelo ni código de inferencia neuronal.

La model card describe, en su lugar, componentes de un ejecutable de escritorio: un núcleo externo en modo usuario con renderizado por Desktop Duplication (sin *hooks* DLL internos), una superposición externa a 144 Hz con cajas 2D/3D y esqueletos, un radar 2D con filtrado de objetos por rareza, suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad, y un escáner dinámico de offsets para resolver firmas de punteros tras parches del juego. Se citan consumos de memoria por módulo (menos de 40 MB, 55 MB, 21 MB, 51 MB y 34 MB respectivamente) y tiempos de respuesta inferiores a 34 ms y 8 ms para el escáner y el cambio de perfiles JSON. Estos datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling* en el sentido de los modelos generativos.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües de procesamiento de lenguaje; la lista de idiomas refleja únicamente los metadatos del repositorio.
- El artefacto declara funcionalidades de superposición externa, radar 2D, filtro de objetos, suavizado de entrada y perfiles JSON conmutables, según la model card.
- No dispone de modo *thinking*, visión, audio ni ninguna capacidad propia de un modelo fundacional.

## Casos de uso

- No aplica: al no ser un modelo de IA, no existen casos de uso legítimos de inferencia, generación o análisis.
- Auditoría de artefactos sospechosos: un equipo de seguridad puede usar esta ficha para identificar que el repositorio no contiene un modelo y descartarlo en pipelines de evaluación de modelos.
- Catalogación de repositorios de Hugging Face: útil como ejemplo de contaminación de metadatos, donde etiquetas de modelo (`license:mit`, listas de idiomas) se aplican a binarios de software.
- Formación en higiene de cadena de suministro: sirve como caso práctico de binarios distribuidos con contraseña de archivo y ejecución como administrador.
- Análisis de reputación de repositorios: permite documentar patrones de repositorios sin descargas ni *likes* que publican ejecutables.
- No se recomienda su instalación ni ejecución en entornos de producción, desarrollo o personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo ni pesos).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un ejecutable Windows x64 que se distribuye como ZIP de 8,9 MB.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, extracción del ZIP con contraseña `2026` y ejecución del `.exe` como administrador.
- Latencia y throughput: no disponibles; la model card cita tiempos de respuesta de menos de 34 ms y menos de 8 ms para módulos internos, sin verificación independiente.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco procede compararlo con otros ejecutables de la misma categoría, ya que no se ha identificado ninguno en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración de arquitectura ni pipeline declarado.
- La ejecución de un binario de origen no verificado, solicitada como administrador y protegida por contraseña de archivo, constituye un riesgo de seguridad elevado (malware, *droppers*, *stealers*).
- La model card incluye enlaces de descarga alojados en un repositorio de GitHub de terceros, no en Hugging Face, lo que dificulta la trazabilidad.
- El contenido se describe como *game cheat*; su uso puede infringir los términos de servicio del videojuego InZOI y acarrear el bloqueo de cuentas.
- No hay evidencias de auditoría, firma de código ni verificación de integridad del binario.
- La licencia MIT se declara en los metadatos, pero no cubre ni garantiza la seguridad del ejecutable distribuido.
- Las cifras de rendimiento y consumo de memoria citadas proceden únicamente del autor y no han sido contrastadas.
- Riesgo de suplantación: el patrón (badges de descargas y valoraciones, contraseña en el ZIP, build con *hash*) es habitual en campañas de distribución de software no deseado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zaper4life/inzoi-cheat-trainer-free
- Repositorio de GitHub citado en la model card: https://github.com/OlgaZhou60580/inzoi-cheat-trainer-free
- Releases del repositorio de GitHub: https://github.com/OlgaZhou60580/inzoi-cheat-trainer-free/releases/latest
- Paquete ZIP citado: https://github.com/OlgaZhou60580/inzoi-cheat-trainer-free/releases/latest/download/inzoi-cheat-trainer-free-v1.2.0-win64.zip
- Paper, blog o demo: no disponible
