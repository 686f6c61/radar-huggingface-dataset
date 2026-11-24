# yyiimmiiyy/questhold-3d-library

## Resumen

QuestHold 3D Library es un repositorio de activos 3D publicado en Hugging Face por el usuario `yyiimmiiyy` bajo el paraguas de QuestHold AI (Goodhope Technologies LLC). No es un modelo de lenguaje ni una red neuronal: es una biblioteca de 2.152 modelos 3D low-poly (criaturas, objetos, props, edificios y personas) que la aplicación QuestHold descarga en el dispositivo del jugador. Cada activo se entrega en dos niveles de detalle (LOD), con etiquetas en inglés y castellano y zonas de color definidas en `library_full.json`.

El paquete ocupa 0,2 GB e incluye los mallas en un formato propio denominado QHM (cabecera `QHM1`), empaquetadas en `library_full.qhm`. El JSON asociado contiene, por cada modelo, su registro de procedencia (`source`), sus palabras clave bilingües y la información de zonas de color. El material se ha generado con las herramientas internas del proyecto (`select.py`, `batch.py`, `qh_library.py`, `pack.py`).

La relevancia de este repositorio es acotada y muy específica: sirve como conjunto de activos listos para usar en el motor o la app de QuestHold, o como referencia para pipelines de reducción, recoloreado y etiquetado de mallas low-poly. No debe confundirse con un checkpoint entrenado ni con un dataset para entrenamiento de modelos generativos 3D, ya que no se documenta ninguna arquitectura, proceso de entrenamiento ni evaluación de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una biblioteca de mallas 3D) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | etiquetas en inglés y castellano (según la model card) |
| Licencia | `cc0-1.0-and-own` (CC0 1.0 para los activos de Grab3D; licencia propia para los activos `gen_*` de Goodhope Technologies LLC) |
| Formato de pesos | no aplica; mallas en formato propio QHM (`QHM1`) más metadatos en `library_full.json` |
| Número de activos | 2.152 modelos low-poly, cada uno en dos niveles de detalle |
| Tamaño del repositorio | 0,2 GB |
| Categorías de activos | criaturas, objetos, props, edificios, personas |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento que describir. El repositorio contiene un conjunto de mallas poligonales de baja densidad, cada una con dos niveles de detalle, producidas a partir de dos fuentes: activos de Grab3D bajo CC0 1.0, que según la model card han sido limpiados, reducidos, recoloreados y re-zonados para QuestHold AI, y activos generados internamente por Goodhope Technologies LLC identificados con el prefijo `gen_*`.

El pipeline de producción se documenta de forma muy escueta: las herramientas `select.py`, `batch.py`, `qh_library.py` y `pack.py`, ubicadas en `tool/models/library` del código fuente de QuestHold AI, se encargan de la selección, el procesado por lotes, la gestión de la biblioteca y el empaquetado en el contenedor QHM. No se especifican recuentos de polígonos por LOD, resolución de texturas, convenciones de ejes, unidades ni esquema de huesos o animaciones. Tampoco se detalla el algoritmo de reducción de malla ni el método de recoloreado o segmentación en zonas de color.

## Capacidades

- Suministro de 2.152 activos 3D low-poly listos para su carga en la aplicación QuestHold.
- Dos niveles de detalle por activo, pensados para gestión de LOD en tiempo de ejecución.
- Etiquetado bilingüe (inglés y castellano) de cada modelo en `library_full.json`.
- Zonas de color por modelo, útiles para recoloreado procedural o variantes de aspecto.
- Trazabilidad de licencia por activo mediante el campo `source` del JSON.
- Cobertura temática amplia: criaturas, objetos, props, edificios y personas.
- No incluye generación de texto, razonamiento, código, matemáticas, visión por computador, tool calling ni capacidades de agente.

## Casos de uso

- Prototipado rápido de escenas 3D en QuestHold: cargar `library_full.qhm` y resolver activos por etiqueta desde `library_full.json` para poblar niveles de prueba sin modelado manual.
- Sistema de LOD en producción: usar los dos niveles de detalle por activo para alternar malla según distancia de cámara y reducir coste de renderizado en dispositivos de gama baja.
- Variantes visuales por facción o bioma: aprovechar las zonas de color definidas por modelo para recolorear criaturas, props y edificios de forma programática sin duplicar geometría.
- Localización de contenido: emplear las etiquetas en inglés y castellano para menús de selección, inventarios o herramientas de authoring dirigidas a ambos mercados.
- Auditoría de licencias: recorrer el campo `source` de `library_full.json` para separar los activos CC0 de Grab3D de los `gen_*` propios y decidir qué puede redistribuirse fuera de QuestHold.
- Base de referencia para pipelines de reducción de malla: usar el conjunto como corpus de comparación al evaluar herramientas propias de decimación, recoloreado y segmentación por zonas.
- Poblamiento de escenarios en prototipos de terceros: reutilizar los activos CC0 (previa verificación de su registro individual) en demos o jam sessions con requisitos de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de una biblioteca de activos 3D y no de un modelo entrenado, no aplican métricas como MMLU, HumanEval o GSM8K. Tampoco se documentan recuentos de polígonos, tiempos de carga ni métricas de rendimiento en el motor.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo. El coste depende de cuántas mallas se carguen simultáneamente en la escena y de su recuento de polígonos, dato no publicado.
- GPU recomendadas: no disponibles. Al ser activos low-poly, el cuello de botella esperable es el ancho de banda de memoria y el número de draw calls, no la capacidad de cómputo.
- GPU de consumo: no se especifica ningún requisito mínimo ni objetivo; la model card no menciona plataformas (móvil, escritorio, consola) ni presupuestos de rendimiento.
- Despliegue: la carga se realiza a través de la app QuestHold, que descarga la biblioteca en el dispositivo del jugador. No se documenta compatibilidad con visores o motores de terceros (Unity, Unreal, Godot, three.js), ni herramientas de conversión desde QHM a glTF u OBJ.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Volumen | Formatos | Licencia | Idiomas de etiquetado |
|---|---|---|---|---|---|
| QuestHold 3D Library | Activos 3D low-poly con LOD y zonas de color | 2.152 activos, 0,2 GB | QHM propio + JSON | CC0 1.0 y licencia propia | Inglés y castellano |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre repositorios equivalentes de activos 3D low-poly con etiquetado bilingüe y formato propietario que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no admite prompts, generación de texto, código ni ninguna tarea de inferencia. Cualquier expectativa en ese sentido es un error de categoría.
- Formato propietario QHM (`QHM1`) sin documentación pública del esquema ni herramientas de conversión publicadas; la integración fuera de QuestHold requiere ingeniería inversa.
- La licencia `cc0-1.0-and-own` es mixta y depende del activo: los `gen_*` quedan bajo licencia propia de Goodhope Technologies LLC, no bajo CC0. Es imprescindible revisar el campo `source` de cada entrada antes de redistribuir.
- El campo de licencia de Hugging Face figura como `other`, lo que puede complicar la validación automática en pipelines de cumplimiento.
- Sin métricas de calidad geométrica publicadas: no hay recuento de polígonos, resolución de texturas, presencia de UVs, normales, huesos ni animaciones.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, al no tratarse de un modelo lingüístico; las etiquetas solo cubren inglés y castellano.
- El repositorio registra 0 descargas y 0 likes, sin señales de adopción ni mantenimiento por parte de la comunidad.
- La fecha de creación y actualización (2026-11-24) es posterior a la fecha actual en muchos entornos, lo que conviene verificar antes de integrar el recurso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yyiimmiiyy/questhold-3d-library
- Grab3D (fuente de los activos CC0): https://grab3d.com
- Licencia Creative Commons Zero 1.0 Universal: https://creativecommons.org/publicdomain/zero/1.0/
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
